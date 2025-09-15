/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import AgentGroup, {AgentGroupElement} from 'gmp/models/agent-groups';
import Filter from 'gmp/models/filter';
import {useCreateMutation} from 'web/queries/useCreateMutation';
import {useGetQuery} from 'web/queries/useGetQuery';
import {useSaveMutation} from 'web/queries/useSaveMutation';

interface AgentGroupCreateParams {
  name: string;
  comment?: string;
  scannerId?: string;
  agents?: {id: string}[];
}

interface AgentGroupModifyParams {
  id: string;
  name?: string;
  comment?: string;
  agents?: {id: string}[];
}

export const useGetAgentGroups = ({filter = undefined}: {filter?: Filter}) =>
  useGetQuery({
    cmd: 'get_agent_groups',
    filter,
    name: 'agentgroup',
    parseEntity: el =>
      AgentGroup.fromElement(el as AgentGroupElement | undefined),
  });

export const useCreateAgentGroup = () =>
  useCreateMutation<AgentGroupCreateParams, unknown>({
    entityKey: 'agentgroup',
  });

export const useModifyAgentGroup = () =>
  useSaveMutation<AgentGroupModifyParams, unknown>({
    entityKey: 'agentgroup',
  });
