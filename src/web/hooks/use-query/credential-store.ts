/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialStoreModifyParams} from 'gmp/commands/credential-store';
import type {EntityActionResponse} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
import type CredentialStore from 'gmp/models/credential-store';
import type Filter from 'gmp/models/filter';
import useGmp from 'web/hooks/useGmp';
import useGetEntities from 'web/queries/useGetEntities';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseModifyCredentialStoreParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseVerifyCredentialStoreParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useGetCredentialStores = ({filter}: {filter?: Filter}) => {
  const gmp = useGmp();
  return useGetEntities<CredentialStore>({
    queryId: 'get_credential_stores',
    filter,
    gmpMethod: gmp.credentialstores.get.bind(gmp.credentialstores),
  });
};

export const useModifyCredentialStore = ({
  onError,
  onSuccess,
}: UseModifyCredentialStoreParams) => {
  const gmp = useGmp();

  return useGmpMutation<
    CredentialStoreModifyParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.credentialstore.modify.bind(gmp.credentialstore),
    invalidateQueryIds: ['get_credential_stores'],
    onError,
    onSuccess,
  });
};

export const useVerifyCredentialStore = ({
  onError,
  onSuccess,
}: UseVerifyCredentialStoreParams) => {
  const gmp = useGmp();

  return useGmpMutation<{id: string}, EntityActionResponse, Rejection>({
    gmpMethod: gmp.credentialstore.verify.bind(gmp.credentialstore),
    onError,
    onSuccess,
  });
};
