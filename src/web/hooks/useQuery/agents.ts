/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {AgentModifyParams} from 'gmp/commands/agent';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import ActionResult from 'gmp/models/actionresult';
import Agent from 'gmp/models/agent';
import Filter from 'gmp/models/filter';
import {parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import {useGetEntities} from 'web/queries/useGetEntities';
import {useSaveMutation} from 'web/queries/useSaveMutation';

interface UseGetAgentsParams {
  filter?: Filter;
  scannerId?: string;
  authorized?: boolean;
  enabled?: boolean;
}

interface UseModifyAgentParams {
  onSuccess?: (res: Response<ActionResult, XmlMeta>) => void;
  onError?: (error: Rejection) => void;
}

export const useGetAgents = ({
  filter,
  scannerId,
  authorized,
  enabled = true,
}: UseGetAgentsParams) => {
  let finalFilter = filter;

  if (isDefined(scannerId)) {
    finalFilter = finalFilter ?? new Filter();
    finalFilter = finalFilter.set('scanner', scannerId);
  }
  if (isDefined(authorized)) {
    finalFilter = finalFilter ?? new Filter();
    finalFilter = finalFilter.set('authorized', parseYesNo(authorized));
  }

  return useGetEntities<Agent>({
    queryId: 'get_agents',
    filter: finalFilter,
    entityType: 'agent',
    enabled,
  });
};

export const useModifyAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams = {}) => {
  const queryClient = useQueryClient();

  const invalidateAgents = () =>
    queryClient.invalidateQueries({
      predicate: q => {
        const key = q.queryKey as unknown as string[];
        return (
          key?.includes?.('get_agents') ||
          (Array.isArray(key) &&
            key[0] === 'get_entities' &&
            key.includes('agent'))
        );
      },
    });

  return useSaveMutation<
    AgentModifyParams,
    Response<ActionResult, XmlMeta>,
    Rejection
  >({
    entityType: 'agent',
    method: 'save',
    invalidateQueryIds: ['get_agents'],
    onSuccess: async res => {
      await invalidateAgents();
      onSuccess?.(res);
    },
    onError,
  });
};
