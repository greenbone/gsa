/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/ui-lib';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {isDefined} from 'gmp/utils/identity';

interface UseGmpMutationParams<TInput, TOutput, TError> {
  gmpMethod: (input: TInput) => Promise<TOutput>;
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
  gmpMethod,
  successMessage,
  onSuccess,
  onError,
  invalidateQueryIds,
}: UseGmpMutationParams<TInput, TOutput, TError>) {
  const queryClient = useQueryClient();
  return useMutation<TOutput, TError, TInput>({
    mutationFn: gmpMethod,
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
            return invalidateQueryIds.includes(queryId);
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

export default useGmpMutation;
