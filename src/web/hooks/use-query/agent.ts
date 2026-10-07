/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {type AgentModifyParams} from 'gmp/commands/agent';
import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {isArray} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useGmpMutation from 'web/queries/useGmpMutation';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseModifyAgentParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDownloadAgentSupportBundleParams {
  onSuccess?: (response: Response<ArrayBuffer>) => void;
  onError?: (error: Error) => void;
}

export interface DownloadAgentSupportBundleInput {
  id: string;
  encryption?: boolean;
}

export const useModifyAgent = ({
  onError,
  onSuccess,
}: UseModifyAgentParams = {}) => {
  const queryClient = useQueryClient();
  const gmp = useGmp();

  const invalidateAgents = () =>
    queryClient.invalidateQueries({
      predicate: q => {
        const key = q.queryKey as unknown as string[];
        return (
          key?.includes?.('get_agents') ||
          (isArray(key) && key[0] === 'get_entities' && key.includes('agent'))
        );
      },
    });

  return useSaveMutation<AgentModifyParams, void, Rejection>({
    entityType: 'agent',
    gmpMethod: gmp.agent.save.bind(gmp.agent),
    invalidateQueryIds: ['get_agents'],
    onSuccess: async () => {
      await invalidateAgents();
      onSuccess?.();
    },
    onError,
  });
};

export const useDeleteAgent = ({onError, onSuccess}: UseModifyAgentParams) => {
  const gmp = useGmp();
  return useDeleteMutation({
    gmpMethod: ({id}) => gmp.agent.delete({id}),
    entityType: 'agent',
    invalidateQueryIds: ['get_agents'],
    onSuccess,
    onError,
  });
};

export const useDownloadAgentSupportBundle = ({
  onSuccess,
  onError,
}: UseDownloadAgentSupportBundleParams = {}) => {
  const gmp = useGmp();

  return useGmpMutation<
    DownloadAgentSupportBundleInput,
    Response<ArrayBuffer>,
    Rejection
  >({
    gmpMethod: ({id, encryption}) =>
      gmp.agent.downloadSupportBundle(id, encryption),
    onSuccess,
    onError,
  });
};
