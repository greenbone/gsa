/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Audit from 'gmp/models/audit';
import useGmp from 'web/hooks/useGmp';
import {type RefetchIntervalFn} from 'web/queries/helpers';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetAuditParams {
  id: string;
  refetchInterval?: RefetchIntervalFn<Audit>;
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
