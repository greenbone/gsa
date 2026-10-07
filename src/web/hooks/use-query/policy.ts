/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Policy from 'gmp/models/policy';
import useGmp from 'web/hooks/useGmp';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetPolicyParams {
  id: string;
}

export const useGetPolicy = ({id}: UseGetPolicyParams) => {
  const gmp = useGmp();
  return useGetEntity<Policy>({
    gmpMethod: gmp.policy.get.bind(gmp.policy),
    queryId: 'get_policy',
    id,
  });
};
