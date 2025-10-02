/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/ui-lib';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {EntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';

interface UseGmpMutationParams<TOutput, TError> {
  entityType: EntityType;
  method: string;
  successMessage?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
  invalidateQueryIds?: string[];
}

export function useGmpMutation<
  TInput = unknown,
  TOutput = unknown,
  TError = Error,
>({
  entityType,
  method,
  successMessage,
  onSuccess,
  onError,
  invalidateQueryIds,
}: UseGmpMutationParams<TOutput, TError>) {
  const gmp = useGmp();
  const gmpCommand = gmp[entityType];
  const gmpMethod = gmpCommand?.[method];
  const queryClient = useQueryClient();

  return useMutation<TOutput, TError, TInput>({
    mutationFn: async (input: TInput) => {
      if (!gmpCommand || !gmpCommand) {
        throw new Error(`GMP command for ${entityType}.${method} not found`);
      }
      return await gmpMethod.call(gmpCommand, input);
    },
    onSuccess: data => {
      if (isDefined(invalidateQueryIds)) {
        /*
         * TODO test cache invalidation based on useGetQuery cmd queryKey: [cmd, token, filter]
         * Invalidate queries for the specific entity type (e.g., get_agents, get_users)
         * Transform entityKey using the same logic as useGetQuery
         */
        void queryClient.invalidateQueries({
          predicate: query => {
            const [queryId] = query.queryKey as [string, ...unknown[]];
            return queryId in invalidateQueryIds;
          },
        });
      }

      if (successMessage) {
        mantineShowSuccessNotification('', successMessage);
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError,
  });
}
