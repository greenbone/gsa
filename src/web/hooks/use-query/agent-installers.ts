/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type AgentInstaller from 'gmp/models/agent-installer';
import type Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetAgentInstallersParams {
  filter?: Filter;
  enabled?: boolean;
}

export const useGetAgentInstallers = ({
  filter,
  enabled,
}: UseGetAgentInstallersParams) => {
  const gmp = useGmp();
  return useGetEntities<AgentInstaller>({
    gmpMethod: gmp.agentinstallers.get.bind(gmp.agentinstallers),
    queryId: 'get_agentinstallers',
    filter,
    enabled,
  });
};
