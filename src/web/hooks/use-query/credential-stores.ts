/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type CredentialStore from 'gmp/models/credential-store';
import {type FilterType} from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';

export const useGetCredentialStores = ({filter}: {filter?: FilterType}) => {
  const gmp = useGmp();
  return useGetEntities<CredentialStore>({
    queryId: 'get_credential_stores',
    filter,
    gmpMethod: gmp.credentialstores.get.bind(gmp.credentialstores),
  });
};
