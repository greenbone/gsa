/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import type Policy from 'gmp/models/policy';
import useGmp from 'web/hooks/useGmp';
import useGetEntity from 'web/queries/useGetEntity';

interface UseGetPolicyParams {
  id: string | undefined;
}

export const useGetPolicy = ({id}: UseGetPolicyParams) => {
  const gmp = useGmp();
  return useGetEntity<Policy>({
    gmpMethod: ({id}: EntityCommandParams) => gmp.policy.get({id}),
    queryId: 'get_policy',
    id,
  });
};
