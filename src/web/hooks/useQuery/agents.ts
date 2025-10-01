/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {AgentModifyParams} from 'gmp/commands/agent';
import Rejection from 'gmp/http/rejection';
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

export const useModifyAgents = () =>
  useSaveMutation<AgentModifyParams, void, Rejection>({
    entityType: 'agent',
    method: 'save',
    invalidateQueryIds: ['get_agents'],
  });
