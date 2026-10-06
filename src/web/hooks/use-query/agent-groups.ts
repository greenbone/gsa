/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentGroup from 'gmp/models/agent-group';
import {type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

export const useGetAgentGroups = ({filter}: {filter?: FilterType}) => {
  const gmp = useGmp();
  return useGetEntities<AgentGroup>({
    queryId: 'get_agent_groups',
    filter,
    gmpMethod: gmp.agentgroups.get.bind(gmp.agentgroups),
  });
};
