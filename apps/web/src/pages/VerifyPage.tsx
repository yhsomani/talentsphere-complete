import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { ApiError, apiJson, errorMessage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import {
  ButtonLink,
  Card,
  CardContent,
  LoadError,
  Notice,
  PageHeader,
} from '../components/ui/index.js';

interface CertificateProof {
  isValid: boolean;
  status: string;
  certificateNumber: string;
  courseTitle: string;
  issuedAt: string;
  revokedAt?: string | null;
  revocationReason?: string | null;
  authority: string;
}

interface EvidenceProof {
  isValid: boolean;
  status: string;
  verificationLevel: string;
  title: string;
  type: string;
  issuedAt: string;
  verifiedAt?: string;
  authority: string;
}

type VerifyResponse =
  | { valid: boolean; type: 'course_certificate'; verification: CertificateProof }
  | { valid: boolean; type: 'evidence_proof'; verification: EvidenceProof };

const label = (value: string) => value.replace(/_/g, ' ');

/**
 * Public credential check (F-52). No sign-in, no personal details: the API returns the
 * credential and its status only, and this page shows exactly that.
 */
export const VerifyPage: React.FC = () => {
  usePageMeta(
    'Verify a credential',
    'Check that a TalentSphere credential is genuine and current.'
  );
  const { hash = '' } = useParams();
  const [result, setResult] = useState<VerifyResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setResult(null);
    setNotFound(false);
    setError(null);
    try {
      setResult(await apiJson<VerifyResponse>(`/api/v1/verify/${encodeURIComponent(hash)}`));
    } catch (err) {
      // A link that matches nothing is a final answer; only a failed request is worth retrying.
      if (err instanceof ApiError && (err.status === 404 || err.status === 400)) setNotFound(true);
      else setError(errorMessage(err));
    }
  }, [hash]);

  useEffect(() => {
    void load();
  }, [load]);

  const v = result?.verification;
  const rows: Array<[string, string]> = !result
    ? []
    : result.type === 'course_certificate'
      ? [
          ['Credential', 'Course certificate'],
          ['Course', result.verification.courseTitle],
          ['Certificate number', result.verification.certificateNumber],
          ['Issued', formatDate(result.verification.issuedAt)],
        ]
      : [
          ['Credential', 'Skill evidence'],
          ['Title', result.verification.title],
          ['Type', label(result.verification.type)],
          ['Verification level', label(result.verification.verificationLevel)],
          ['Issued', formatDate(result.verification.issuedAt)],
          ...(result.verification.verifiedAt
            ? ([['Verified', formatDate(result.verification.verifiedAt)]] as Array<
                [string, string]
              >)
            : []),
        ];

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }} data-testid="verify-page">
      <PageHeader title="Credential verification" />
      {error && <LoadError message={error} onRetry={() => void load()} />}
      {notFound && (
        <Notice tone="error" data-testid="verify-notfound">
          No credential matches this link. Check that it was copied in full.
        </Notice>
      )}
      {!error && !notFound && !result && <p role="status">Checking this credential.</p>}
      {result && v && (
        <>
          <Notice
            tone={result.valid ? 'success' : 'error'}
            style={{ marginBottom: spacing.md }}
            data-testid="verify-status"
          >
            {result.valid
              ? 'Valid. This credential is genuine and current.'
              : `Not valid. Status: ${label(v.status)}.`}
            {'revocationReason' in v && v.revocationReason ? ` Reason: ${v.revocationReason}` : ''}
          </Notice>
          <Card>
            <CardContent style={{ padding: spacing.lg }}>
              <dl style={{ margin: 0 }}>
                {rows.map(([term, value]) => (
                  <div key={term} style={{ marginBottom: spacing.sm }}>
                    <dt style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>{term}</dt>
                    <dd style={{ margin: 0 }}>{value}</dd>
                  </div>
                ))}
              </dl>
              <p
                style={{ color: colors.neutral[700], fontSize: '0.875rem', marginTop: spacing.md }}
              >
                Issued by {v.authority}. This page shows no personal details.
              </p>
            </CardContent>
          </Card>
        </>
      )}
      <p style={{ marginTop: spacing.lg }}>
        <ButtonLink to="/" variant="outline">
          About TalentSphere
        </ButtonLink>{' '}
        <Link to="/jobs">Browse jobs</Link>
      </p>
    </div>
  );
};
