import {
  CURRENT_SESSION_VERSION, RECOVERY_BACKUP_PREFIX, SESSION_VERSION_STORAGE_KEY,
  isValidSession, inspectAnswers, type AssessmentSnapshot, type RepairedAssessment
} from './sessionIntegrity';
import { SESSION_IDS_STORAGE_KEY, SESSION_SEED_STORAGE_KEY, createSessionSeed } from './session';

export const ANSWERS_STORAGE_KEY = 'mindflow_answers_v1';

type RecoveryStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function readAssessmentSnapshot(storage: RecoveryStorage): AssessmentSnapshot {
  return {
    answersRaw: storage.getItem(ANSWERS_STORAGE_KEY),
    idsRaw: storage.getItem(SESSION_IDS_STORAGE_KEY),
    seedRaw: storage.getItem(SESSION_SEED_STORAGE_KEY),
    versionRaw: storage.getItem(SESSION_VERSION_STORAGE_KEY)
  };
}

export type RecoveryCommitResult =
  | { ok: true; backupKey: string }
  | { ok: false; reason: 'invalid-candidate' | 'storage-failed' };

/**
 * Backup first, then write the four existing assessment keys and verify them.
 * On failure attempt a full rollback; never report success from partial writes.
 * No changes occur until this function is called by explicit user interaction.
 */
export function commitVerifiedRecovery(
  storage: RecoveryStorage,
  candidate: RepairedAssessment,
  backupSuffix = createSessionSeed()
): RecoveryCommitResult {
  if (!candidate.seed || !isValidSession(candidate.questions, candidate.seed)) {
    return { ok: false, reason: 'invalid-candidate' };
  }
  const inspected = inspectAnswers(candidate.questions, candidate.answers);
  if (!inspected.clean || inspected.canonicalAnswers.length !== candidate.answers.length) {
    return { ok: false, reason: 'invalid-candidate' };
  }

  const backupKey = RECOVERY_BACKUP_PREFIX + backupSuffix;
  const originals: Array<[string, string | null]> = [];
  try {
    if (storage.getItem(backupKey) !== null) return { ok: false, reason: 'storage-failed' };
    const snapshot = readAssessmentSnapshot(storage);
    originals.push(
      [ANSWERS_STORAGE_KEY, snapshot.answersRaw],
      [SESSION_IDS_STORAGE_KEY, snapshot.idsRaw],
      [SESSION_SEED_STORAGE_KEY, snapshot.seedRaw],
      [SESSION_VERSION_STORAGE_KEY, snapshot.versionRaw]
    );
    const backupText = JSON.stringify(snapshot);
    storage.setItem(backupKey, backupText);
    if (storage.getItem(backupKey) !== backupText) return { ok: false, reason: 'storage-failed' };

    const changes: Array<[string, string]> = [
      [ANSWERS_STORAGE_KEY, JSON.stringify(inspected.canonicalAnswers)],
      [SESSION_IDS_STORAGE_KEY, JSON.stringify(candidate.questions.map((q) => q.id))],
      [SESSION_SEED_STORAGE_KEY, candidate.seed],
      [SESSION_VERSION_STORAGE_KEY, CURRENT_SESSION_VERSION]
    ];
    for (const [key, value] of changes) storage.setItem(key, value);
    for (const [key, value] of changes) {
      if (storage.getItem(key) !== value) throw new Error('Unverified recovery write');
    }
    return { ok: true, backupKey };
  } catch {
    for (const [key, value] of originals) {
      try {
        if (value === null) storage.removeItem(key);
        else storage.setItem(key, value);
      } catch {
        // Backup remains accessible when browser storage supports it.
        // The caller must report failure and preserve the recovery UI.
      }
    }
    return { ok: false, reason: 'storage-failed' };
  }
}
