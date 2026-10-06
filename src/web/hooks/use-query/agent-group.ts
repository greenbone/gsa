/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type AgentGroupCreateParams,
  type AgentGroupSaveParams,
} from 'gmp/commands/agent-group';
import {type EntityActionResponse} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
import AgentGroup from 'gmp/models/agent-group';
import useGmp from 'web/hooks/useGmp';
import useCloneMutation from 'web/queries/useCloneMutation';
import useCreateMutation from 'web/queries/useCreateMutation';
import useDeleteMutation from 'web/queries/useDeleteMutation';
import useSaveMutation from 'web/queries/useSaveMutation';

interface UseCreateAgentGroupParams {
  onSuccess?: (data: EntityActionResponse) => void;
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
  return useCreateMutation<
    AgentGroupCreateParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.agentgroup.create.bind(gmp.agentgroup),
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
  return useCloneMutation<EntityActionResponse, Rejection>({
    gmpMethod: gmp.agentgroup.clone.bind(gmp.agentgroup),
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
  return useSaveMutation<AgentGroupSaveParams, void, Rejection>({
    gmpMethod: gmp.agentgroup.save.bind(gmp.agentgroup),
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
