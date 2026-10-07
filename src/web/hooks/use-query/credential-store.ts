/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type CredentialStoreVerifyParams,
  type CredentialStoreModifyParams,
} from 'gmp/commands/credential-store';
import useGmp from 'web/hooks/useGmp';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseEditCredentialStoreParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseVerifyCredentialStoreParams {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useEditCredentialStore = ({
  onError,
  onSuccess,
}: UseEditCredentialStoreParams) => {
  const gmp = useGmp();
  return useGmpMutation<CredentialStoreModifyParams>({
    gmpMethod: async data => {
      const response = await gmp.credentialstore.edit(data);
      return response.data;
    },
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

  return useGmpMutation<CredentialStoreVerifyParams>({
    gmpMethod: async ({id}) => {
      const response = await gmp.credentialstore.verify({id});
      return response.data;
    },
    onError,
    onSuccess,
  });
};
