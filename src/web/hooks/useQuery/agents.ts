/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {type AgentModifyParams} from 'gmp/commands/agent';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fastxml';
import Agent from 'gmp/models/agent';
import Filter from 'gmp/models/filter';
import {isFilter} from 'gmp/models/filter/utils';
import {parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseGetAgentsParams {
  filter?: Filter;
  scannerId?: string;
  authorized?: boolean;
  enabled?: boolean;
}

interface UseModifyAgentParams {
  onSuccess?: () => void;
  onError?: (error: Rejection) => void;
}

type AgentBulkInput = Agent[] | Filter;

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

  const gmp = useGmp();
  return useGetEntities<Agent>({
    gmpMethod: gmp.agents.get.bind(gmp.agents),
    queryId: 'get_agents',
    filter: finalFilter,
    enabled,
  });
};

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
          (Array.isArray(key) &&
            key[0] === 'get_entities' &&
            key.includes('agent'))
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
    gmpMethod: gmp.agent.delete.bind(gmp.agentgroup),
    entityType: 'agentgroup',
    invalidateQueryIds: ['get_agents'],
    onSuccess,
    onError,
  });
};

export const useBulkDeleteAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<AgentBulkInput, Response<Agent[], XmlMeta>, Rejection>({
    gmpMethod: (input: AgentBulkInput) => {
      return isFilter(input)
        ? gmp.agents.deleteByFilter(input)
        : gmp.agents.delete(input);
    },
    invalidateQueryIds: ['get_agents'],
    successMessage: _('Agents successfully deleted'),
    onSuccess,
    onError,
  });
};

export const useBulkAuthorizeAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<AgentBulkInput, void, Rejection>({
    gmpMethod: (input: AgentBulkInput) => {
      return isFilter(input)
        ? gmp.agents.authorizeByFilter(input)
        : gmp.agents.authorize(input);
    },
    invalidateQueryIds: ['get_agents'],
    successMessage: _('Agents successfully authorized'),
    onSuccess,
    onError,
  });
};

export const useBulkRevokeAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<AgentBulkInput, void, Rejection>({
    gmpMethod: (input: AgentBulkInput) => {
      return isFilter(input)
        ? gmp.agents.revokeByFilter(input)
        : gmp.agents.revoke(input);
    },
    invalidateQueryIds: ['get_agents'],
    successMessage: _('Agents successfully revoked'),
    onSuccess,
    onError,
  });
};
