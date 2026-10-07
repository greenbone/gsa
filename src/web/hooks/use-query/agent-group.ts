/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type AgentGroupCreateParams,
  type AgentGroupSaveParams,
} from 'gmp/commands/agent-group';
import {type EntityActionData} from 'gmp/commands/entity';
import AgentGroup from 'gmp/models/agent-group';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseCreateAgentGroupParams {
  onSuccess?: (data: EntityActionData) => void;
  onError?: (error: Error) => void;
}

interface UseModifyAgentGroupParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useCreateAgentGroup = ({
  onSuccess,
  onError,
}: UseCreateAgentGroupParams) => {
  const gmp = useGmp();
  return useCreateMutation<AgentGroupCreateParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.agentgroup.create(data);
      return response.data;
    },
    entityType: AgentGroup.entityType,
    invalidateQueryIds: ['get_agent_groups'],
    onError,
    onSuccess,
  });
};

export const useCloneAgentGroup = ({
  onError,
  onSuccess,
}: UseCreateAgentGroupParams) => {
  const gmp = useGmp();
  return useCloneMutation<EntityActionData>({
    gmpMethod: async ({id}) => {
      const response = await gmp.agentgroup.clone({id});
      return response.data;
    },
    entityType: AgentGroup.entityType,
    invalidateQueryIds: ['get_agent_groups'],
    onError,
    onSuccess,
  });
};

export const useSaveAgentGroup = ({
  onError,
  onSuccess,
}: UseModifyAgentGroupParams) => {
  const gmp = useGmp();
  return useSaveMutation<AgentGroupSaveParams>({
    gmpMethod: async data => {
      await gmp.agentgroup.save(data);
    },
    entityType: AgentGroup.entityType,
    invalidateQueryIds: ['get_agent_groups'],
    onError,
    onSuccess,
  });
};

export const useDeleteAgentGroup = ({
  onError,
  onSuccess,
}: UseModifyAgentGroupParams) => {
  const gmp = useGmp();
  return useDeleteMutation({
    gmpMethod: ({id}) => gmp.agentgroup.delete({id}),
    entityType: AgentGroup.entityType,
    invalidateQueryIds: ['get_agent_groups'],
    onSuccess,
    onError,
  });
};
