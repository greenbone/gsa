/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Credential from 'gmp/models/credential';
import {type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

interface UseGetCredentialsParams {
  enabled?: boolean;
  filter?: FilterType;
  staleTime?: number;
}

export const useGetCredentials = ({
  enabled,
  filter,
  staleTime,
}: UseGetCredentialsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Credential>({
    gmpMethod: gmp.credentials.get.bind(gmp.credentials),
    queryId: 'get_credentials',
    enabled,
    filter,
    staleTime,
  });
};

export const useGetAllCredentials = ({
  enabled,
  filter,
  staleTime,
}: UseGetCredentialsParams = {}) => {
  const gmp = useGmp();
  return useGetEntities<Credential>({
    gmpMethod: gmp.credentials.getAll.bind(gmp.credentials),
    queryId: 'get_credentials',
    enabled,
    filter,
    staleTime,
  });
};
