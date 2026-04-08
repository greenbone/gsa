/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Audit from 'gmp/models/audit';
import type Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import type {RefetchIntervalFn} from 'web/queries/helpers';
import useGetEntities from 'web/queries/useGetEntities';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetAuditParams {
  id: string;
  refetchInterval?: RefetchIntervalFn<Audit>;
}

interface UseGetAuditsParams {
  filter?: Filter;
}

export const useGetAudit = ({id, refetchInterval}: UseGetAuditParams) => {
  const gmp = useGmp();
  return useGetEntity<Audit>({
    gmpMethod: gmp.audit.get.bind(gmp.audit),
    queryId: 'get_audit',
    id,
    refetchInterval,
  });
};

export const useGetAudits = ({filter}: UseGetAuditsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Audit>({
    gmpMethod: gmp.audits.get.bind(gmp.audits),
    queryId: 'get_audits',
    filter,
  });
};
