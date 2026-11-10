import { describe, expect, it } from 'vitest';
import { questions } from '../data/questions';
import { buildAssessmentSession, SESSION_IDS_STORAGE_KEY, SESSION_SEED_STORAGE_KEY } from './session';
import { CURRENT_SESSION_VERSION, RECOVERY_BACKUP_PREFIX, SESSION_VERSION_STORAGE_KEY } from './sessionIntegrity';
import { ANSWERS_STORAGE_KEY, commitVerifiedRecovery, readAssessmentSnapshot } from './recoveryPersistence';

function storageFixture(failOnSet?: string) {
  const map = new Map<string, string>([
    [ANSWERS_STORAGE_KEY, JSON.stringify([{ questionId: 'old', value: 'x', score: 1 }])],
    [SESSION_IDS_STORAGE_KEY, JSON.stringify(['old', 'old'])],
    [SESSION_SEED_STORAGE_KEY, 'prior-seed']
  ]);
  const storage = {
    getItem: (key: string) => map.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === failOnSet) throw new Error('Simulated quota/security failure');
      map.set(key, value);
    },
    removeItem: (key: string) => { map.delete(key); }
  };
  return { map, storage };
}
const seed = 'verified-recovery';
const session = buildAssessmentSession(questions, { sessionSeed: seed });
const candidate = {
  seed,
  questions: session,
  answers: session.slice(0, 20).map((q) => ({
    questionId: q.id, value: q.options[0].value, score: q.options[0].score
  }))
};

describe('backup-first recovery storage transactions', () => {
  it('writes a preserved backup and only then persists the complete verified candidate', () => {
    const { storage } = storageFixture();
    const before = readAssessmentSnapshot(storage);
    const result = commitVerifiedRecovery(storage, candidate, 'success');
    expect(result).toEqual({ ok: true, backupKey: RECOVERY_BACKUP_PREFIX + 'success' });
    expect(JSON.parse(storage.getItem(RECOVERY_BACKUP_PREFIX + 'success') ?? '')).toEqual(before);
    expect(JSON.parse(storage.getItem(SESSION_IDS_STORAGE_KEY) ?? '[]')).toEqual(session.map((q) => q.id));
    expect(storage.getItem(SESSION_SEED_STORAGE_KEY)).toBe(seed);
    expect(storage.getItem(SESSION_VERSION_STORAGE_KEY)).toBe(CURRENT_SESSION_VERSION);
    expect(JSON.parse(storage.getItem(ANSWERS_STORAGE_KEY) ?? '[]')).toEqual(candidate.answers);
  });

  it('refuses to overwrite a pre-existing backup or accept a malformed candidate', () => {
    const { storage, map } = storageFixture();
    map.set(RECOVERY_BACKUP_PREFIX + 'existing', 'valuable older backup');
    const before = readAssessmentSnapshot(storage);
    expect(commitVerifiedRecovery(storage, candidate, 'existing').ok).toBe(false);
    expect(storage.getItem(RECOVERY_BACKUP_PREFIX + 'existing')).toBe('valuable older backup');
    const invalidCandidate = { ...candidate, questions: session.slice(0, 1) };
    expect(commitVerifiedRecovery(storage, invalidCandidate, 'invalid')).toEqual({ ok: false, reason: 'invalid-candidate' });
    expect(readAssessmentSnapshot(storage)).toEqual(before);
  });

  it('leaves original assessment keys untouched if backup storage fails', () => {
    const { storage } = storageFixture(RECOVERY_BACKUP_PREFIX + 'blocked');
    const before = readAssessmentSnapshot(storage);
    expect(commitVerifiedRecovery(storage, candidate, 'blocked')).toEqual({ ok: false, reason: 'storage-failed' });
    expect(readAssessmentSnapshot(storage)).toEqual(before);
  });

  it('rolls back a failed assessment write and keeps the original backup', () => {
    const { storage } = storageFixture(SESSION_IDS_STORAGE_KEY);
    const before = readAssessmentSnapshot(storage);
    expect(commitVerifiedRecovery(storage, candidate, 'midway')).toEqual({ ok: false, reason: 'storage-failed' });
    expect(readAssessmentSnapshot(storage)).toEqual(before);
    expect(JSON.parse(storage.getItem(RECOVERY_BACKUP_PREFIX + 'midway') ?? '')).toEqual(before);
  });

  it('rejects duplicate candidate answers before writing a backup', () => {
    const { storage } = storageFixture();
    const badCandidate = { ...candidate, answers: [...candidate.answers, candidate.answers[0]] };
    expect(commitVerifiedRecovery(storage, badCandidate, 'bad')).toEqual({ ok: false, reason: 'invalid-candidate' });
    expect(storage.getItem(RECOVERY_BACKUP_PREFIX + 'bad')).toBeNull();
  });
});
