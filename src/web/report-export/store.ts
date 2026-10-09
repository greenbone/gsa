/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ExportAttempt} from 'web/report-export/job';

type AttemptMetadata = Pick<
  ExportAttempt,
  'filename' | 'reportTitle' | 'reportUrl'
>;

export type ExportAttemptEvent =
  | {type: 'add'; attempt: ExportAttempt}
  | {type: 'remove'; key: string}
  | {type: 'retain'; keys: ReadonlySet<string>}
  | ({key: string} & (
      | {type: 'created'; exportId: string}
      | {type: 'adopt'; metadata: AttemptMetadata}
      | {type: 'auto-download'}
      | {type: 'queue-cancel'}
      | {type: 'cancel'}
      | {type: 'cancel-accepted'}
      | {type: 'cancel-failed'; error: Error}
      | {type: 'transfer'}
      | {type: 'wait'; error?: Error}
      | {type: 'resume'}
      | {type: 'handoff'}
      | {type: 'handoff-failed'; error: Error}
      | {type: 'fail'; error: Error}
    ));

type TransitionEvent = Exclude<
  ExportAttemptEvent,
  {type: 'add' | 'remove' | 'retain'}
>;

const changeAttempt = (
  attempt: ExportAttempt,
  allowed: boolean,
  changes: Partial<ExportAttempt>,
) => (allowed ? {...attempt, ...changes} : attempt);

const transitionAttempt = (
  attempt: ExportAttempt,
  event: TransitionEvent,
): ExportAttempt => {
  const {phase} = attempt;
  if (attempt.disposition === 'handed-off') return attempt;
  switch (event.type) {
    case 'created':
      return changeAttempt(attempt, phase.stage === 'creating', {
        exportId: event.exportId,
        phase:
          phase.stage === 'creating' && phase.cancelRequested
            ? phase
            : {stage: 'tracking'},
      });
    case 'adopt':
      return {
        ...attempt,
        ...event.metadata,
        autoDownload: true,
        origin: 'local',
      };
    case 'auto-download':
      return changeAttempt(attempt, !attempt.autoDownload, {
        autoDownload: true,
      });
    case 'queue-cancel':
      return changeAttempt(
        attempt,
        phase.stage === 'creating' && !phase.cancelRequested,
        {phase: {stage: 'creating', cancelRequested: true}},
      );
    case 'cancel':
      return changeAttempt(
        attempt,
        Boolean(attempt.exportId) &&
          ['tracking', 'waiting', 'creating'].includes(phase.stage),
        {phase: {stage: 'canceling'}, cancelError: undefined},
      );
    case 'cancel-accepted':
      return changeAttempt(attempt, phase.stage === 'canceling', {
        phase: {stage: 'cancel-requested'},
      });
    case 'cancel-failed':
      return changeAttempt(attempt, phase.stage === 'canceling', {
        phase: {stage: 'tracking'},
        cancelError: event.error,
      });
    case 'transfer':
      return changeAttempt(
        attempt,
        Boolean(attempt.exportId) &&
          attempt.disposition === 'awaiting' &&
          ['tracking', 'waiting', 'cancel-requested'].includes(phase.stage),
        {phase: {stage: 'transferring'}},
      );
    case 'wait':
      return changeAttempt(
        attempt,
        ['transferring', 'waiting'].includes(phase.stage),
        {phase: {stage: 'waiting', error: event.error}},
      );
    case 'resume':
      return changeAttempt(
        attempt,
        ['tracking', 'waiting', 'abandoned'].includes(phase.stage),
        {phase: {stage: 'tracking'}, disposition: 'awaiting'},
      );
    case 'handoff':
      return changeAttempt(
        attempt,
        ['transferring', 'handoff-failed'].includes(phase.stage),
        {phase: {stage: 'handed-off'}, disposition: 'handed-off'},
      );
    case 'handoff-failed':
      return changeAttempt(
        attempt,
        ['transferring', 'handoff-failed'].includes(phase.stage),
        {phase: {stage: 'handoff-failed', error: event.error}},
      );
    case 'fail':
      return changeAttempt(
        attempt,
        ['creating', 'transferring'].includes(phase.stage),
        {phase: {stage: 'failed', error: event.error}},
      );
  }
};

export const reduceExportAttempts = (
  attempts: ExportAttempt[],
  event: ExportAttemptEvent,
): ExportAttempt[] => {
  if (event.type === 'add')
    return attempts.some(attempt => attempt.key === event.attempt.key)
      ? attempts
      : [...attempts, event.attempt];
  if (event.type === 'remove' || event.type === 'retain') {
    const retained = attempts.filter(attempt =>
      event.type === 'remove'
        ? attempt.key !== event.key
        : event.keys.has(attempt.key),
    );
    return retained.length === attempts.length ? attempts : retained;
  }
  const index = attempts.findIndex(attempt => attempt.key === event.key);
  if (index === -1) return attempts;
  const changed = transitionAttempt(attempts[index], event);
  if (changed === attempts[index]) return attempts;
  return attempts.map((attempt, position) =>
    position === index ? changed : attempt,
  );
};

export const createExportAttemptStore = (initial: ExportAttempt[] = []) => {
  let snapshot = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    getAttempt: (key: string) => snapshot.find(attempt => attempt.key === key),
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispatch: (event: ExportAttemptEvent) => {
      const next = reduceExportAttempts(snapshot, event);
      if (next === snapshot) return false;
      snapshot = next;
      listeners.forEach(listener => listener());
      return true;
    },
  };
};
