/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import type Agent from 'gmp/models/agent';
import type FilterType from 'gmp/models/filter/filter-type';
import QueryFilter from 'gmp/models/filter/query-filter';
import {isFilterType} from 'gmp/models/filter/utils';
import {parseYesNo} from 'gmp/parser';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseGetAgentsParams {
  filter?: FilterType;
  scannerId?: string;
  authorized?: boolean;
  enabled?: boolean;
}

interface UseModifyAgentParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

type AgentBulkInput = Agent[] | FilterType;

export const useGetAgents = ({
  filter,
  scannerId,
  authorized,
  enabled = true,
}: UseGetAgentsParams) => {
  let finalFilter = filter;

  if (isDefined(scannerId)) {
    finalFilter = finalFilter ?? new QueryFilter();
    finalFilter = finalFilter.and(
      QueryFilter.fromString(`scanner_uuid=${scannerId}`),
    );
  }
  if (isDefined(authorized)) {
    finalFilter = finalFilter ?? new QueryFilter();
    finalFilter = finalFilter.and(
      QueryFilter.fromString(`authorized=${parseYesNo(authorized)}`),
    );
  }

  const gmp = useGmp();
  return useGetEntities<Agent>({
    gmpMethod: gmp.agents.get.bind(gmp.agents),
    queryId: 'get_agents',
    filter: finalFilter,
    enabled,
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
      return isFilterType(input)
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
      return isFilterType(input)
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
      return isFilterType(input)
        ? gmp.agents.revokeByFilter(input)
        : gmp.agents.revoke(input);
    },
    invalidateQueryIds: ['get_agents'],
    successMessage: _('Agents successfully revoked'),
    onSuccess,
    onError,
  });
};

export const useSyncAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams = {}) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<void, void, Error>({
    gmpMethod: () => gmp.agents.sync(),
    invalidateQueryIds: ['get_agents'],
    successMessage: _('Agents successfully synced'),
    onSuccess,
    onError,
  });
};

export const useBulkEnableUpdateToLatestAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<AgentBulkInput, void, Rejection>({
    gmpMethod: (input: AgentBulkInput) => {
      return isFilterType(input)
        ? gmp.agents.enableUpdateToLatestByFilter(input)
        : gmp.agents.enableUpdateToLatest(input);
    },
    invalidateQueryIds: ['get_agents'],
    successMessage: _(
      'Enabled automatic update to latest for Agents successfully',
    ),
    onSuccess,
    onError,
  });
};

export const useBulkDisableUpdateToLatestAgents = ({
  onError,
  onSuccess,
}: UseModifyAgentParams) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return useGmpMutation<AgentBulkInput, void, Rejection>({
    gmpMethod: (input: AgentBulkInput) => {
      return isFilterType(input)
        ? gmp.agents.disableUpdateToLatestByFilter(input)
        : gmp.agents.disableUpdateToLatest(input);
    },
    invalidateQueryIds: ['get_agents'],
    successMessage: _(
      'Disabled automatic update to latest for Agents successfully',
    ),
    onSuccess,
    onError,
  });
};
