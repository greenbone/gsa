/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialCommandCreateParams} from 'gmp/commands/credential';
import {type EntityActionData} from 'gmp/commands/entity';
import useGmp from 'web/hooks/useGmp';
import useCreateMutation from 'web/queries/useCreateMutation';

interface UseCredentialMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateCredential = ({
  onSuccess,
  onError,
}: UseCredentialMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useCreateMutation<
    CredentialCommandCreateParams,
    EntityActionData,
    Error
  >({
    gmpMethod: async data => {
      const response = await gmp.credential.create(data);
      return response.data;
    },
    entityType: 'credential',
    invalidateQueryIds: ['get_credentials'],
    onSuccess,
    onError,
  });
};
