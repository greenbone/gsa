/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import type Audit from 'gmp/models/audit';
import useGmp from 'web/hooks/useGmp';
import {type RefetchIntervalFn} from 'web/queries/helpers';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetAuditParams {
  id: string | undefined;
  refetchInterval?: RefetchIntervalFn<Audit>;
}

export const useGetAudit = ({id, refetchInterval}: UseGetAuditParams) => {
  const gmp = useGmp();
  return useGetEntity<Audit>({
    gmpMethod: ({id}: EntityCommandParams) => gmp.audit.get({id}),
    queryId: 'get_audit',
    id,
    refetchInterval,
  });
};
