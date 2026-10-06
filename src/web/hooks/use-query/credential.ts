/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CredentialCommandCreateParams} from 'gmp/commands/credential';
import {type EntityActionData} from 'gmp/commands/entity';
import useGmp from 'web/hooks/useGmp';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseCredentialMutationCallbacks<TResponse> {
  onSuccess?: (response: TResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateCredential = ({
  onSuccess,
  onError,
}: UseCredentialMutationCallbacks<EntityActionData> = {}) => {
  const gmp = useGmp();
  return useGmpMutation<CredentialCommandCreateParams, EntityActionData>({
    gmpMethod: async data => {
      const response = await gmp.credential.create(data);
      return response.data;
    },
    invalidateQueryIds: ['get_credentials'],
    onSuccess,
    onError,
  });
};
