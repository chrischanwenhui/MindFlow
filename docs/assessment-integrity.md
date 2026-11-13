# Assessment integrity repair

## Reproduction and scope

Reproduced against master commit `c580534e75ee074b69a474d7622f9c08b954df87` before changing production code. The existing 159 tests passed; the new reproduction tests initially had 14 failures:

- With seed `assessment-integrity-0`, English `mbti-jp-12` displayed “Early agreement and firm milestones” with value `P`, and “Ongoing coordination as conditions evolve” with value `J`. Their canonical values are `J` and `P`, respectively. Chinese and Malay also assigned translated MBTI labels to opposite values after shuffling.
- English cognitive translations could also move labels between scored options. The default Likert translations in all five non-English languages depended on display position when the options were reversed.
- Chinese and Malay `cog-numerical-1` asked for 15% of 200, while the canonical question asks what number has 18 as 30%. Their memory item 1 used `7 - 1 - 4 - 9 - 2` and asked for the second number; the canonical stimulus is `7 - 1 - M - 9 - T` and asks for the third item. Matching option counts did not establish semantic equivalence.
- The three pattern keys failed an independent calculation using constant second differences:

| ID | Successive gaps | Next gap | Correct next term | Formerly awarded |
| --- | --- | --- | --- | --- |
| cog-pattern-1 | 3, 4, 5, 6 | 7 | 29 | 27 |
| cog-pattern-8 | 3, 6, 9, 12 | 15 | 52 | 50 |
| cog-pattern-12 | 1, 2, 3, 4, 5 | 6 | 23 | 24 |

Only these six option weights change: each corrected answer receives 2 and its former keyed distractor receives 0.

## Choice binding and localization

Translation arrays are authored in canonical bank order. They are now bound once to a question-local identity consisting of the canonical option's value and canonical English label. Session localization looks up that identity, regardless of the shuffled position. Value alone is insufficient because several cognitive choices share both value and score. Score is excluded from identity so correcting a weight cannot change the label binding. Identity keys are internal and are never persisted.

Likert defaults use the option's score (1–5), and the unknown-answer default uses value `default-idk`. Existing values, question IDs, storage keys, session version, seeded sampling and shuffle behavior are preserved. The UI still submits the displayed option's own value and score.

All question-specific Chinese and Malay overrides described an earlier bank or used obsolete IDs. They are removed, retaining generic Likert labels, unknown-answer labels and domain hints. Current questions use canonical English prompts, stimuli, recall questions and choices until reviewed translations are available. In each of these two languages, the removed IDs are:

- Current but stale: `mbti-ei-1`, `mbti-sn-1`, `riasec-1`, `riasec-6`, `cog-pattern-1`, `cog-verbal-1`, `cog-numerical-1`, `cog-spatial-1`, `cog-memory-1`, `cog-memory-2`, `cog-memory-3`.
- Obsolete: `motivation-1`, `stress-1`, `leadership-1`, `workstyle-1`. These are not aliased to current `mslw-*` questions: their tasks and choices differ.

Unknown translation IDs are ignored. An override with an incompatible option count is rejected as a whole, including any prompt or memory stimulus. Missing option labels fall back to canonical labels or applicable generic defaults. Structural validation cannot detect a semantically stale translation with the same option count: future translations must be reviewed against the current complete task, including all stimuli and choices. If the canonical bank's content or order changes, its translations must be reviewed too.

## Historical saved-answer limitations

The `Answer` contract stores only `{ questionId, value, score }`. The session stores IDs and seed, but no bank revision, per-answer language, clicked position, displayed label or presentation history. Session version `1` is a storage-contract marker, not a question-bank revision.

For example, the former choice `27` at 2 points and the corrected choice `29` at 2 points both serialize as `{ questionId: 'cog-pattern-1', value: 'pattern', score: 2 }`. Several cognitive distractors likewise share a zero-point payload. Unique MBTI pole values retain what was submitted, but do not prove what label was displayed. Even a uniquely valued memory selection does not establish which localized stimulus the person saw. A saved seed can reconstruct today's order; it cannot prove the historical displayed content.

This repair does not rewrite, infer selected labels for, or regrade old answers. Previously valid value/score records remain valid under the existing gates, including ambiguous pattern records. Historical scores may therefore remain affected by the old keys or display defect. Passing current structural validation does not certify historical presentation integrity. Users who need a result from consistently corrected questions need to start a fresh assessment explicitly; this PR does not force or silently perform a reset.

Git history also shows that memory options before commit `5eb8c59` all used the domain value `memory`. Those records cannot reliably be mapped to the current unique memory option values. Existing validation flags them, preserves the raw snapshot, and refuses automatic recovery that could replay an exposed memory task. No migration or recovery contract is changed here.

A future historical migration would require separate design for stable persisted choice IDs and presentation/bank provenance, plus explicit decisions about existing ambiguous records. This PR deliberately preserves the present storage contract.

## Exact modified files

| File | Purpose |
| --- | --- |
| `src/data/questions.ts` | Correct only the three verified pattern keys. |
| `src/data/patternKeys.test.ts` | Independently derive next terms from prompt sequences using finite differences. |
| `src/i18n/questions/index.ts` | Bind canonical choice identity before session shuffling; handle generic labels and unsafe/unknown overrides. |
| `src/i18n/questions/types.ts` | Document the canonical-order authoring contract. |
| `src/i18n/questions/zh.ts` | Remove stale and obsolete task overrides. |
| `src/i18n/questions/ms.ts` | Remove stale and obsolete task overrides. |
| `src/i18n/questions/assessmentIntegrity.test.ts` | Exercise display/submission mappings, permutations, incomplete translations, legacy IDs and saved reconstruction. |
| `src/engine/historicalAnswers.test.ts` | Demonstrate historical ambiguity and preservation of old records; retain memory recovery protection. |
| `docs/assessment-integrity.md` | Record evidence, scope, validation, risks and remaining limitations. |

MBTI, Big Five and RIASEC scoring/report algorithms, fictional/personal report separation, non-diagnostic wording, privacy safeguards and recovery implementation are unchanged.

## Validation

- `npm run lint`: passed.
- `npm run test`: 24 files, 185 tests passed (26 new tests).
- `npm run build`: passed, including the application TypeScript build and Vite bundle.
- `git diff --check`: passed.

Property coverage includes 100 distinct seeded sessions per language (`en`, `zh`, `ms`, `ja`, `ko`, `th`), both MBTI option orders, every canonical question in normal and reversed option order, reversed question iteration, and localization before versus after deterministic shuffling. Saved IDs and seeds reconstruct the same question/option order; full stored answer snapshots hydrate without rewriting and still satisfy report-access validation. Additional fixtures test same-value/same-score distractors, score-independent binding, missing labels, incompatible option counts and obsolete translation IDs.

Remaining risks are reduced Chinese/Malay question translation coverage and unverifiable historical presentation/score integrity. Reverting restores the earlier presentation/key defects; there is no new persisted schema to roll back. No merge, production deployment, direct master push, or historical data migration is part of this change.
