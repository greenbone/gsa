/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialStoreModifyParams} from 'gmp/commands/credential-store';
import {type EntityActionResponse} from 'gmp/commands/entity';
import type Rejection from 'gmp/http/rejection';
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

  return useGmpMutation<
    CredentialStoreModifyParams,
    EntityActionResponse,
    Rejection
  >({
    gmpMethod: gmp.credentialstore.edit.bind(gmp.credentialstore),
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
