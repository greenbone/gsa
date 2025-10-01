/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  AgentGroupCreateParams,
  AgentGroupSaveParams,
} from 'gmp/commands/agentgroup';
import {EntityActionResponse} from 'gmp/commands/entity';
import Rejection from 'gmp/http/rejection';
import AgentGroup from 'gmp/models/agentgroup';
import Filter from 'gmp/models/filter';
import {useCreateMutation} from 'web/queries/useCreateMutation';
import {useGetEntities} from 'web/queries/useGetEntities';
import {useSaveMutation} from 'web/queries/useSaveMutation';

interface UseCreateAgentGroupParams {
  onSuccess?: (data: EntityActionResponse) => void;
  onError?: (error: Rejection) => void;
}

interface UseModifyAgentGroupParams {
  onSuccess?: () => void;
  onError?: (error: Rejection) => void;
}

export const useGetAgentGroups = ({filter}: {filter?: Filter}) =>
  useGetEntities<AgentGroup>({
    queryId: 'get_agent_groups',
    filter,
    entityType: 'agentgroup',
  });

export const useCreateAgentGroup = ({
  onSuccess,
  onError,
}: UseCreateAgentGroupParams) =>
  useCreateMutation<AgentGroupCreateParams, EntityActionResponse, Rejection>({
    entityType: 'agentgroup',
    invalidateQueryIds: ['get_agent_groups'],
    onError,
    onSuccess,
  });

export const useSaveAgentGroup = ({
  onError,
  onSuccess,
}: UseModifyAgentGroupParams) =>
  useSaveMutation<AgentGroupSaveParams, void, Rejection>({
    entityType: 'agentgroup',
    invalidateQueryIds: ['get_agent_groups'],
    onError,
    onSuccess,
  });
