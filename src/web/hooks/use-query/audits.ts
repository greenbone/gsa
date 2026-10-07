/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Audit from 'gmp/models/audit';
import {type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetAuditsParams {
  filter?: FilterType;
}

export const useGetAudits = ({filter}: UseGetAuditsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Audit>({
    gmpMethod: gmp.audits.get.bind(gmp.audits),
    queryId: 'get_audits',
    filter,
  });
};
