/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Filter from 'gmp/models/filter';
import type Policy from 'gmp/models/policy';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetPolicyParams {
  id: string;
}

interface UseGetPoliciesParams {
  filter?: Filter;
}

export const useGetPolicy = ({id}: UseGetPolicyParams) => {
  const gmp = useGmp();
  return useGetEntity<Policy>({
    // @ts-expect-error policy command is dynamically added via registerCommand()
    gmpMethod: gmp.policy.get.bind(gmp.policy),
    queryId: 'get_policy',
    id,
  });
};

export const useGetPolicies = ({filter}: UseGetPoliciesParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Policy>({
    // @ts-expect-error policies command is dynamically added via registerCommand()
    gmpMethod: gmp.policies.get.bind(gmp.policies),
    queryId: 'get_policies',
    filter,
  });
};
