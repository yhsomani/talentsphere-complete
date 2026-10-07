import { User, Profile, Evidence } from '@talentsphere/domain';

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'candidate@talentsphere.test',
    roles: ['candidate'],
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: '10000000-0000-0000-0000-000000000001',
    userId: '00000000-0000-0000-0000-000000000001',
    fullName: 'Jane Doe',
    headline: 'Senior Full-Stack Engineer',
    bio: 'Passionate about building verified career evidence and high-scale systems.',
    location: 'Bengaluru, India',
    privacy: 'public',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockEvidence(overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: '20000000-0000-0000-0000-000000000001',
    subjectId: '00000000-0000-0000-0000-000000000001',
    type: 'project',
    title: 'Distributed Job Queue Engine',
    description: 'High-throughput transactional queue built with Node.js and PostgreSQL.',
    source: 'github.com/janedoe/queue-engine',
    provenance: 'commit_hash:abc1234',
    verificationLevel: 'peer_reviewed',
    status: 'verified',
    recencyDate: '2026-09-01',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
