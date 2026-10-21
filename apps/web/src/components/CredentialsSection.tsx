import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing } from '@talentsphere/ui';
import { apiJson, errorMessage } from '../lib/api.js';
import { formatDate } from '../lib/format.js';
import { Card, CardContent, LoadError } from './ui/index.js';

interface Certificate {
  id: string;
  certificateNumber: string;
  courseTitle: string;
  issuedAt: string;
  status: string;
  verificationUrl: string;
  /** The evidence item minted with this certificate, so it is not listed twice. */
  evidenceId?: string | null;
}

interface EvidenceRow {
  id: string;
  title: string;
  type: string;
  status: string;
  verificationLevel: string;
  recencyDate: string;
}

/** One verifiable credential, whatever its source. `verifyUrl` is the public /verify/:hash page. */
interface Credential {
  key: string;
  title: string;
  detail: string;
  date: string;
  status: string;
  verifyUrl?: string;
}

const label = (value: string) => value.replace(/_/g, ' ');

/**
 * Certificates and verified skill evidence (F-96). Each row links to the public,
 * zero-PII verification page, so a recruiter can check it without signing in.
 */
export const CredentialsSection: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [certs, evidence] = await Promise.all([
        apiJson<{ certificates: Certificate[] }>('/api/v1/certificates/my'),
        apiJson<{ evidence: EvidenceRow[] }>('/api/v1/evidence/mine'),
      ]);
      // shortcut: one request per verified evidence item to fetch its proof hash;
      // fine for a handful of items, return the hash from /evidence/mine if lists grow.
      const covered = new Set(certs.certificates.map((c) => c.evidenceId).filter(Boolean));
      const verified = evidence.evidence.filter(
        (e) => e.status === 'verified' && !covered.has(e.id)
      );
      const proofs = await Promise.allSettled(
        verified.map((e) =>
          apiJson<{ proof: { proofHash: string } }>(`/api/v1/evidence/${e.id}/verify-public`)
        )
      );
      setCredentials([
        ...certs.certificates.map((c) => ({
          key: `cert-${c.id}`,
          title: c.courseTitle,
          detail: `Course certificate ${c.certificateNumber}`,
          date: c.issuedAt,
          status: c.status,
          verifyUrl: c.verificationUrl,
        })),
        ...verified.map((e, i) => {
          const proof = proofs[i];
          return {
            key: `ev-${e.id}`,
            title: e.title,
            detail: `Skill evidence · ${label(e.type)} · ${label(e.verificationLevel)}`,
            date: e.recencyDate,
            status: e.status,
            verifyUrl:
              proof.status === 'fulfilled' ? `/verify/${proof.value.proof.proofHash}` : undefined,
          };
        }),
      ]);
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card style={{ marginTop: spacing['2xl'] }} data-testid="credentials">
      <CardContent style={{ padding: spacing.lg }}>
        <h2 style={{ fontSize: '1.125rem' }}>Credentials</h2>
        <p style={{ color: colors.neutral[700], margin: `${spacing.xs} 0 ${spacing.md}` }}>
          Certificates and verified skill evidence. Anyone can check each one with its link, without
          signing in, and no personal details are shown there.
        </p>
        {error && <LoadError message={error} onRetry={() => void load()} />}
        {!error && credentials === null && <p role="status">Loading your credentials.</p>}
        {credentials?.length === 0 && (
          <p data-testid="credentials-empty">
            No credentials yet. Finish a course, or have a piece of evidence verified, and it shows
            up here.
          </p>
        )}
        {credentials && credentials.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }} data-testid="credentials-list">
            {credentials.map((c) => (
              <li
                key={c.key}
                style={{
                  padding: `${spacing.sm} 0`,
                  borderTop: `1px solid ${colors.neutral[200]}`,
                }}
              >
                <strong>{c.title}</strong>
                <div style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                  {c.detail} · {c.status === 'verified' ? 'Verified' : label(c.status)} ·{' '}
                  {formatDate(c.date)}
                </div>
                {c.verifyUrl ? (
                  <Link to={c.verifyUrl} data-testid="credential-verify-link">
                    Verification link
                  </Link>
                ) : (
                  <span style={{ color: colors.neutral[700], fontSize: '0.875rem' }}>
                    Verification link unavailable right now.
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
