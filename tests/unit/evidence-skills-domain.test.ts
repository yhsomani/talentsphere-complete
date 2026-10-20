import { describe, it, expect } from 'vitest';
import {
  createEvidence,
  verifyEvidence,
  disputeEvidence,
  revokeEvidence,
  generatePublicProof,
  createSkillRelationship,
  wouldCreatePrerequisiteCycle,
  traverseSkillGraph,
  type Evidence,
  type Skill,
  type SkillRelationship,
} from '../../packages/domain/src/index.js';

describe('Evidence Graph & Verification Domain Model (F-96, BR-149..155)', () => {
  const subjectId = 'c0000000-0000-4000-a000-000000000001';
  const peerVerifier = {
    userId: 'p0000000-0000-4000-a000-000000000002',
    role: 'candidate' as const,
  };
  const instructorVerifier = {
    userId: 'i0000000-0000-4000-a000-000000000003',
    role: 'instructor' as const,
  };
  const adminVerifier = {
    userId: 'a0000000-0000-4000-a000-000000000004',
    role: 'platform_admin' as const,
  };

  it('creates evidence in pending and unverified initial state', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'project',
      title: 'Distributed KV Store in Rust',
      description: 'Built Raft consensus distributed storage system.',
      source: 'https://github.com/rust-kv',
      provenance: 'github_repository',
      recencyDate: '2026-03-15',
    });

    expect(evidence.id).toBeDefined();
    expect(evidence.subjectId).toBe(subjectId);
    expect(evidence.verificationLevel).toBe('unverified');
    expect(evidence.status).toBe('pending');
    expect(evidence.title).toBe('Distributed KV Store in Rust');
  });

  it('enforces anti-gaming: prevents subject from self-verifying evidence', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'assessment',
      title: 'Advanced TypeScript Certification',
      description: 'Passed algorithmic challenge',
      source: 'platform_assessment',
      provenance: 'system_log',
      recencyDate: '2026-04-01',
    });

    expect(() => {
      verifyEvidence(evidence, { userId: subjectId, role: 'platform_admin' }, 'authority_verified');
    }).toThrowError(/Subject cannot self-verify evidence/);
  });

  it('allows peer review elevation by authorized peer', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'project',
      title: 'Full Stack App',
      description: 'E-commerce platform',
      source: 'github',
      provenance: 'pr_merged',
      recencyDate: '2026-05-10',
    });

    // A peer with a recorded relationship: they gave the subject a reference.
    const verified = verifyEvidence(
      evidence,
      peerVerifier,
      'peer_reviewed',
      'Code review approved.',
      undefined,
      { isConfirmedReferee: true }
    );
    expect(verified.verificationLevel).toBe('peer_reviewed');
    expect(verified.status).toBe('verified');
    expect(verified.verifiedBy).toBe(peerVerifier.userId);
    expect(verified.verifiedAt).toBeDefined();
    expect(verified.metadata?.verificationNotes).toBe('Code review approved.');
    expect(verified.metadata?.verifiedByRole).toBe('peer');
  });

  it('refuses peer review from an account with no relationship to the subject (G-01)', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'project',
      title: 'Full Stack App',
      description: 'E-commerce platform',
      source: 'github',
      provenance: 'pr_merged',
      recencyDate: '2026-05-10',
    });

    expect(() => verifyEvidence(evidence, peerVerifier, 'peer_reviewed')).toThrow(
      /recorded relationship/
    );
    // Verification staff may peer-review anyone.
    expect(
      verifyEvidence(
        evidence,
        { userId: 'v0000000-0000-4000-a000-000000000009', role: 'verification_staff' },
        'peer_reviewed'
      ).verificationLevel
    ).toBe('peer_reviewed');
  });

  it('never lets a peer undo a dispute, lower a level, or take over a verification (REV-02)', () => {
    const base = createEvidence({
      subjectId,
      type: 'project',
      title: 'Full Stack App',
      description: 'E-commerce platform',
      source: 'github',
      provenance: 'pr_merged',
      recencyDate: '2026-05-10',
    });
    const related = { isConfirmedReferee: true };

    // A record staff verified at authority level cannot be lowered by a peer.
    const authority = verifyEvidence(base, adminVerifier, 'authority_verified');
    expect(() =>
      verifyEvidence(authority, peerVerifier, 'peer_reviewed', undefined, undefined, related)
    ).toThrow(/cannot lower/);

    // A disputed record is resolved by staff only.
    const disputed = disputeEvidence(authority, adminVerifier, 'Audit found no record');
    expect(() =>
      verifyEvidence(disputed, peerVerifier, 'peer_reviewed', undefined, undefined, related)
    ).toThrow(/disputed/);
    expect(
      verifyEvidence(
        disputed,
        { userId: 'v0000000-0000-4000-a000-000000000009', role: 'verification_staff' },
        'authority_verified'
      ).status
    ).toBe('verified');

    // A second peer cannot replace the first peer's review (and its verifiedBy).
    const peerReviewed = verifyEvidence(
      base,
      peerVerifier,
      'peer_reviewed',
      undefined,
      undefined,
      related
    );
    expect(() =>
      verifyEvidence(
        peerReviewed,
        { userId: 'p0000000-0000-4000-a000-000000000099', role: 'candidate' },
        'peer_reviewed',
        undefined,
        undefined,
        related
      )
    ).toThrow(/already peer_reviewed/);

    // A peer reviewer cannot revoke the subject's evidence.
    expect(() => revokeEvidence(peerReviewed, peerVerifier, 'Changed my mind')).toThrow(/owner/);
  });

  it('uses every role an account holds, not only the first (G-25)', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'institution_credential',
      title: 'AWS Solutions Architect',
      description: 'Professional level',
      source: 'aws',
      provenance: 'credly',
      recencyDate: '2026-04-01',
    });
    const verified = verifyEvidence(
      evidence,
      { userId: 'a0000000-0000-4000-a000-000000000044', roles: ['candidate', 'platform_admin'] },
      'authority_verified'
    );
    expect(verified.verificationLevel).toBe('authority_verified');
    expect(verified.metadata?.verifiedByRole).toBe('platform_admin');
  });

  it('lets only staff, the verifier or a related peer dispute; the owner may revoke (G-01, G-02)', () => {
    const ownerUserId = 'u0000000-0000-4000-a000-000000000005';
    const evidence = verifyEvidence(
      createEvidence({
        subjectId,
        type: 'project',
        title: 'Full Stack App',
        description: 'E-commerce platform',
        source: 'github',
        provenance: 'pr_merged',
        recencyDate: '2026-05-10',
      }),
      adminVerifier,
      'authority_verified'
    );
    const stranger = { userId: 's0000000-0000-4000-a000-000000000006', role: 'candidate' as const };

    expect(() => disputeEvidence(evidence, stranger, 'I do not believe it')).toThrow(
      /recorded relationship/
    );
    expect(
      disputeEvidence(evidence, stranger, 'Worked with them; the dates are wrong', {
        isConfirmedReferee: true,
      }).status
    ).toBe('disputed');
    expect(disputeEvidence(evidence, adminVerifier, 'Audit').status).toBe('disputed');
    expect(
      disputeEvidence(evidence, { userId: 'm0', role: 'moderator' }, 'Reported content').status
    ).toBe('disputed');

    expect(() => revokeEvidence(evidence, stranger, 'Not mine', ownerUserId)).toThrow(/owner/);
    expect(
      revokeEvidence(evidence, { userId: ownerUserId, role: 'candidate' }, 'Outdated', ownerUserId)
        .status
    ).toBe('revoked');
  });

  it('enforces role authorization on institution and authority verification', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'course_completion',
      title: 'Systems Architecture Specialization',
      description: 'Completed 6-course sequence',
      source: 'university_lms',
      provenance: 'accredited_institution',
      recencyDate: '2026-06-01',
    });

    // Regular candidate cannot issue institution verification
    expect(() => {
      verifyEvidence(evidence, peerVerifier, 'institution_verified');
    }).toThrowError(/Institution verification requires/);

    // Instructor can issue institution verification
    const instVerified = verifyEvidence(evidence, instructorVerifier, 'institution_verified');
    expect(instVerified.verificationLevel).toBe('institution_verified');

    // Instructor cannot issue platform authority verification
    expect(() => {
      verifyEvidence(instVerified, instructorVerifier, 'authority_verified');
    }).toThrowError(/Authority verification requires/);

    // Admin can issue authority verification
    const authVerified = verifyEvidence(instVerified, adminVerifier, 'authority_verified');
    expect(authVerified.verificationLevel).toBe('authority_verified');
  });

  it('supports evidence dispute and attaches dispute reasoning', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'work_experience',
      title: 'Lead Architect at TechCorp',
      description: 'Claimed role leadership',
      source: 'linkedin_claim',
      provenance: 'unverified_import',
      recencyDate: '2026-02-01',
    });

    const disputed = disputeEvidence(
      evidence,
      adminVerifier,
      'Company denies employment during this period.'
    );
    expect(disputed.status).toBe('disputed');
    expect(disputed.metadata?.disputeReason).toBe('Company denies employment during this period.');
    expect(disputed.metadata?.disputedBy).toBe(adminVerifier.userId);
  });

  it('revokes evidence with append-only audit trail (BR-149)', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'project',
      title: 'Plagiarized Project',
      description: 'Copied repository',
      source: 'github',
      provenance: 'direct_submission',
      recencyDate: '2026-01-01',
    });

    const revoked = revokeEvidence(
      evidence,
      adminVerifier,
      'Plagiarism verified by integrity committee.'
    );
    expect(revoked.status).toBe('revoked');
    expect(revoked.metadata?.revocationReason).toBe('Plagiarism verified by integrity committee.');
    expect(revoked.metadata?.revokedAt).toBeDefined();

    // Revoked evidence cannot be subsequent verified or disputed
    expect(() => {
      verifyEvidence(revoked, peerVerifier, 'peer_reviewed');
    }).toThrowError(/Cannot verify a revoked evidence record/);

    expect(() => {
      disputeEvidence(revoked, adminVerifier, 'Another dispute');
    }).toThrowError(/Cannot dispute an already revoked evidence record/);
  });

  it('generates privacy-preserving public verification proof with zero PII (BR-150, BR-155)', () => {
    const evidence = createEvidence({
      subjectId,
      type: 'assessment',
      title: 'Cloud Security Engineer Assessment',
      description: 'Confidential assessment results',
      source: 'assessment_sandbox',
      provenance: 'proctored_session',
      recencyDate: '2026-07-20',
      metadata: { privateCandidateEmail: 'candidate@secret.com' },
    });

    const verified = verifyEvidence(evidence, adminVerifier, 'authority_verified');
    const proof = generatePublicProof(verified);

    expect(proof.evidenceId).toBe(verified.id);
    expect(proof.title).toBe(verified.title);
    expect(proof.verificationLevel).toBe('authority_verified');
    expect(proof.status).toBe('verified');
    expect(proof.proofHash).toBeDefined();
    expect(proof.proofHash.length).toBe(64); // SHA-256 hex
    expect(proof.verificationUrl).toBe(`/verify/evidence/${verified.id}`);

    // Verify zero PII leak
    const jsonString = JSON.stringify(proof);
    expect(jsonString).not.toContain('candidate@secret.com');
    expect(jsonString).not.toContain('Confidential assessment results');
  });
});

describe('Skills Graph & Taxonomy Domain Model (F-84, BR-141..147)', () => {
  const skillA: Skill = {
    id: 's0000000-0000-4000-a000-000000000001',
    slug: 'typescript',
    name: 'TypeScript',
    category: 'Programming Languages',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const skillB: Skill = {
    id: 's0000000-0000-4000-a000-000000000002',
    slug: 'react',
    name: 'React',
    category: 'Frontend Frameworks',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const skillC: Skill = {
    id: 's0000000-0000-4000-a000-000000000003',
    slug: 'nextjs',
    name: 'Next.js',
    category: 'Full Stack Frameworks',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  it('prevents self-referencing relationship', () => {
    expect(() => {
      createSkillRelationship([], {
        sourceSkillId: skillA.id,
        targetSkillId: skillA.id,
        relationshipType: 'prerequisite_of',
      });
    }).toThrowError(/Skill cannot have a relationship with itself/);
  });

  it('detects cycles in prerequisite relationships (BR-147)', () => {
    // Relationship 1: TypeScript is prerequisite of React (TS -> React)
    const rel1: SkillRelationship = {
      id: 'r1',
      sourceSkillId: skillA.id,
      targetSkillId: skillB.id,
      relationshipType: 'prerequisite_of',
      weight: 1.0,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    // Relationship 2: React is prerequisite of Next.js (React -> Next.js)
    const rel2: SkillRelationship = {
      id: 'r2',
      sourceSkillId: skillB.id,
      targetSkillId: skillC.id,
      relationshipType: 'prerequisite_of',
      weight: 1.0,
      createdAt: '2026-01-01T00:00:00.000Z',
    };

    const existing = [rel1, rel2];

    // Check: Next.js is prerequisite of TypeScript would cause cycle: TS -> React -> Next -> TS
    const wouldCycle = wouldCreatePrerequisiteCycle(existing, skillC.id, skillA.id);
    expect(wouldCycle).toBe(true);

    expect(() => {
      createSkillRelationship(existing, {
        sourceSkillId: skillC.id,
        targetSkillId: skillA.id,
        relationshipType: 'prerequisite_of',
      });
    }).toThrowError(/circular dependency/);
  });

  it('traverses skill graph bounded by depth limit (BR-146)', () => {
    const allSkills = new Map<string, Skill>([
      [skillA.id, skillA],
      [skillB.id, skillB],
      [skillC.id, skillC],
    ]);

    const relationships: SkillRelationship[] = [
      {
        id: 'r1',
        sourceSkillId: skillA.id,
        targetSkillId: skillB.id,
        relationshipType: 'prerequisite_of',
        weight: 1.0,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'r2',
        sourceSkillId: skillB.id,
        targetSkillId: skillC.id,
        relationshipType: 'subskill_of',
        weight: 0.8,
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ];

    const graph = traverseSkillGraph(skillB, allSkills, relationships, 5);

    expect(graph.skill.slug).toBe('react');
    expect(graph.prerequisites).toHaveLength(1);
    expect(graph.prerequisites[0].slug).toBe('typescript');
    expect(graph.subskills).toHaveLength(1);
    expect(graph.subskills[0].slug).toBe('nextjs');
    expect(graph.depth).toBeLessThanOrEqual(5);
  });
});
