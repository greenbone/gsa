/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {credentialAwareApi, type GroupSummary} from 'web/credential-aware/api';
import useSessionToken from 'web/hooks/useSessionToken';

interface MultiTargetTaskState {
  byTaskId: Record<string, GroupSummary>;
  error?: string;
  refresh: () => Promise<void>;
  start: (group: GroupSummary) => Promise<void>;
  stop: (group: GroupSummary) => Promise<void>;
}

const emptyState: MultiTargetTaskState = {
  byTaskId: {},
  refresh: async () => {},
  start: async () => {},
  stop: async () => {},
};

const Context = createContext<MultiTargetTaskState>(emptyState);

export const useMultiTargetTasks = () => useContext(Context);

export const MultiTargetTasksProvider = ({children}: {children: ReactNode}) => {
  const token = useSessionToken();
  const [byTaskId, setByTaskId] = useState<Record<string, GroupSummary>>({});
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    try {
      const summaries = await credentialAwareApi<GroupSummary[]>(
        token,
        'groups/summary',
      );
      setByTaskId(
        Object.fromEntries(
          summaries
            .filter(group => group.native_task_id)
            .map(group => [group.native_task_id as string, group]),
        ),
      );
      setError(undefined);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }, [token]);

  useEffect(() => {
    const update = () => void refresh();
    queueMicrotask(update);
    const interval = window.setInterval(update, 15000);
    window.addEventListener('credential-aware-groups-changed', update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('credential-aware-groups-changed', update);
    };
  }, [refresh]);

  const run = async (group: GroupSummary, action: 'start' | 'stop') => {
    const result = await credentialAwareApi<{
      failed: Array<{task_id: string; error: string}>;
    }>(token, `groups/${encodeURIComponent(group.id)}/${action}`, {});
    await refresh();
    window.dispatchEvent(new Event('credential-aware-groups-changed'));
    if (result.failed.length) {
      throw new Error(result.failed.map(item => item.error).join('; '));
    }
  };

  return (
    <Context.Provider
      value={{
        byTaskId,
        error,
        refresh,
        start: group => run(group, 'start'),
        stop: group => run(group, 'stop'),
      }}
    >
      {children}
    </Context.Provider>
  );
};
