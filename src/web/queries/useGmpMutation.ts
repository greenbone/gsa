/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/ui-lib';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';

interface UseGmpMutationParams<TOutput> {
  entityKey: string;
  method: string;
  successMessage?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: unknown) => void;
  invalidateQueries?: boolean;
}

export function useGmpMutation<TInput = unknown, TOutput = unknown>({
  entityKey,
  method,
  successMessage,
  onSuccess,
  onError,
  invalidateQueries = true,
}: UseGmpMutationParams<TOutput>) {
  const gmp = useGmp();
  const gmpEntity = gmp[entityKey];
  const gmpCommand = gmpEntity?.[method];
  const queryClient = useQueryClient();

  return useMutation<TOutput, unknown, TInput>({
    mutationFn: async (input: TInput) => {
      if (!gmpEntity || !gmpCommand) {
        throw new Error(`GMP command for ${entityKey}.${method} not found`);
      }
      return await gmpCommand.call(gmpEntity, input);
    },
    onSuccess: (data, variables, context) => {
      if (invalidateQueries) {
        // Invalidate all queries to ensure fresh data
        void queryClient.invalidateQueries();
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
