/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type ReportExportAttempt,
  isAttemptInStage,
} from 'web/report-export/report-export-job-model';

type ReportExportAttemptMetadata = Pick<
  ReportExportAttempt,
  'filename' | 'reportTitle' | 'reportUrl'
>;

export type ReportExportAttemptEvent =
  | {type: 'add'; attempt: ReportExportAttempt}
  | {type: 'remove'; key: string}
  | {type: 'retain'; keys: ReadonlySet<string>}
  | ({key: string} & (
      | {type: 'created'; exportId: string}
      | {type: 'adopt'; metadata: ReportExportAttemptMetadata}
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
  ReportExportAttemptEvent,
  {type: 'add' | 'remove' | 'retain'}
>;

const updateAttemptIfAllowed = (
  attempt: ReportExportAttempt,
  isAllowed: boolean,
  updates: Partial<ReportExportAttempt>,
) => (isAllowed ? {...attempt, ...updates} : attempt);

const applyAttemptEvent = (
  attempt: ReportExportAttempt,
  event: TransitionEvent,
): ReportExportAttempt => {
  const {phase} = attempt;
  if (phase.stage === 'handed-off') return attempt;
  switch (event.type) {
    case 'created':
      return updateAttemptIfAllowed(attempt, phase.stage === 'creating', {
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
      return updateAttemptIfAllowed(attempt, !attempt.autoDownload, {
        autoDownload: true,
      });
    case 'queue-cancel':
      return updateAttemptIfAllowed(
        attempt,
        phase.stage === 'creating' && !phase.cancelRequested,
        {phase: {stage: 'creating', cancelRequested: true}},
      );
    case 'cancel':
      return updateAttemptIfAllowed(
        attempt,
        Boolean(attempt.exportId) &&
          isAttemptInStage(phase, 'tracking', 'waiting', 'creating'),
        {phase: {stage: 'canceling'}, cancelError: undefined},
      );
    case 'cancel-accepted':
      return updateAttemptIfAllowed(attempt, phase.stage === 'canceling', {
        phase: {stage: 'cancel-requested'},
      });
    case 'cancel-failed':
      return updateAttemptIfAllowed(attempt, phase.stage === 'canceling', {
        phase: {stage: 'tracking'},
        cancelError: event.error,
      });
    case 'transfer':
      return updateAttemptIfAllowed(
        attempt,
        Boolean(attempt.exportId) &&
          isAttemptInStage(phase, 'tracking', 'waiting', 'cancel-requested'),
        {phase: {stage: 'transferring'}},
      );
    case 'wait':
      return updateAttemptIfAllowed(
        attempt,
        isAttemptInStage(phase, 'transferring', 'waiting'),
        {
          phase: {stage: 'waiting', error: event.error},
        },
      );
    case 'resume':
      return updateAttemptIfAllowed(
        attempt,
        isAttemptInStage(phase, 'tracking', 'waiting'),
        {phase: {stage: 'tracking'}},
      );
    case 'handoff':
      return updateAttemptIfAllowed(
        attempt,
        isAttemptInStage(phase, 'transferring', 'handoff-failed'),
        {
          phase: {stage: 'handed-off'},
        },
      );
    case 'handoff-failed':
      return updateAttemptIfAllowed(
        attempt,
        isAttemptInStage(phase, 'transferring', 'handoff-failed'),
        {phase: {stage: 'handoff-failed', error: event.error}},
      );
    case 'fail':
      return updateAttemptIfAllowed(
        attempt,
        isAttemptInStage(phase, 'creating', 'transferring'),
        {phase: {stage: 'failed', error: event.error}},
      );
  }
};

export const reduceReportExportAttempts = (
  attempts: ReportExportAttempt[],
  event: ReportExportAttemptEvent,
): ReportExportAttempt[] => {
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
  const changed = applyAttemptEvent(attempts[index], event);
  if (changed === attempts[index]) return attempts;
  return attempts.map((attempt, position) =>
    position === index ? changed : attempt,
  );
};

export const createReportExportAttemptStore = (
  initialAttempts: ReportExportAttempt[] = [],
) => {
  let snapshot = initialAttempts;
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
    dispatch: (event: ReportExportAttemptEvent) => {
      const next = reduceReportExportAttempts(snapshot, event);
      if (next === snapshot) return false;
      snapshot = next;
      listeners.forEach(listener => listener());
      return true;
    },
  };
};
