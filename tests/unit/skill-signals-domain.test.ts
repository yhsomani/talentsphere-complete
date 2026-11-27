import { describe, expect, it } from 'vitest';
import type { Evidence } from '../../packages/domain/src/core.js';
import {
  deriveEvidenceSignals,
  explainSkillMatch,
  projectSkillProfile,
  recordSkillSignals,
} from '../../packages/domain/src/skill-signals.js';

const evidence = (over: Partial<Evidence> = {}): Evidence => ({
  id: 'ev-1',
  subjectId: 'profile-1',
  type: 'project',
  title: 'Chat engine',
  description: '',
  source: 'github',
  provenance: 'direct',
  verificationLevel: 'unverified',
  status: 'pending',
  recencyDate: '2026-05-15',
  createdAt: '2026-05-15T10:00:00.000Z',
  updatedAt: '2026-05-15T10:00:00.000Z',
  ...over,
});

describe('skill-signal ledger (TS-07)', () => {
  it('derives one signal per mapped skill at the evidence verification level', () => {
    const signals = deriveEvidenceSignals(evidence(), ['sql', 'ts', 'sql']);
    expect(signals.map((s) => [s.skillId, s.rung, s.sourceRef])).toEqual([
      ['sql', 'unverified', 'ev-1'],
      ['ts', 'unverified', 'ev-1'],
    ]);
    for (const status of ['disputed', 'revoked', 'expired'] as const) {
      expect(deriveEvidenceSignals(evidence({ status }), ['sql'])).toEqual([]);
    }
  });

  it('writes only when the live set changes, so a repeated write is a no-op', () => {
    const first = deriveEvidenceSignals(evidence(), ['sql']);
    expect(recordSkillSignals([], first)).toEqual(first);
    expect(recordSkillSignals(first, deriveEvidenceSignals(evidence(), ['sql']))).toBeNull();
    const verified = deriveEvidenceSignals(
      evidence({ verificationLevel: 'authority_verified', status: 'verified' }),
      ['sql']
    );
    expect(recordSkillSignals(first, verified)).toEqual(verified);
    expect(recordSkillSignals(verified, [])).toEqual([]);
  });

  it('projects the strongest rung per skill and names every source', () => {
    const profile = projectSkillProfile([
      ...deriveEvidenceSignals(evidence(), ['sql', 'ts']),
      ...deriveEvidenceSignals(
        evidence({
          id: 'ev-2',
          verificationLevel: 'peer_reviewed',
          status: 'verified',
          verifiedAt: '2026-06-01T00:00:00.000Z',
        }),
        ['sql']
      ),
    ]);
    expect(profile).toEqual([
      {
        skillId: 'sql',
        strongestRung: 'peer_reviewed',
        signalCount: 2,
        lastSignalAt: '2026-06-01T00:00:00.000Z',
        sources: [
          { sourceModule: 'evidence', sourceRef: 'ev-2', rung: 'peer_reviewed' },
          { sourceModule: 'evidence', sourceRef: 'ev-1', rung: 'unverified' },
        ],
      },
      {
        skillId: 'ts',
        strongestRung: 'unverified',
        signalCount: 1,
        lastSignalAt: '2026-05-15T10:00:00.000Z',
        sources: [{ sourceModule: 'evidence', sourceRef: 'ev-1', rung: 'unverified' }],
      },
    ]);
  });
});

describe('explainSkillMatch', () => {
  const entry = (skillId: string, rung: Evidence['verificationLevel']) => ({
    skillId,
    strongestRung: rung,
    signalCount: 1,
    lastSignalAt: '2026-05-15T10:00:00.000Z',
    sources: [{ sourceModule: 'evidence' as const, sourceRef: `ev-${skillId}`, rung }],
  });

  it('keeps the posting order, de-duplicates and counts shown and verified skills', () => {
    const match = explainSkillMatch(
      ['sql', 'go', 'ts', 'sql'],
      [
        entry('ts', 'unverified'),
        entry('sql', 'peer_reviewed'),
        entry('rust', 'authority_verified'),
      ]
    );
    expect(match).toEqual({
      required: 3,
      shown: 2,
      verified: 1,
      skills: [
        {
          skillId: 'sql',
          shown: true,
          strongestRung: 'peer_reviewed',
          sources: [{ sourceModule: 'evidence', sourceRef: 'ev-sql', rung: 'peer_reviewed' }],
        },
        { skillId: 'go', shown: false, strongestRung: null, sources: [] },
        {
          skillId: 'ts',
          shown: true,
          strongestRung: 'unverified',
          sources: [{ sourceModule: 'evidence', sourceRef: 'ev-ts', rung: 'unverified' }],
        },
      ],
    });
  });

  it('is empty for a posting with no required skills', () => {
    expect(explainSkillMatch([], [entry('sql', 'unverified')])).toEqual({
      required: 0,
      shown: 0,
      verified: 0,
      skills: [],
    });
  });
});
