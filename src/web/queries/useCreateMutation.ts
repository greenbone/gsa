/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';

interface UseCreateMutationParams<TOutput> {
  entityKey: string;
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: unknown) => void;
}

export function useCreateMutation<TInput = unknown, TOutput = unknown>({
  entityKey,
  method = 'create',
  onSuccess,
  onError,
}: UseCreateMutationParams<TOutput>) {
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
      // Invalidate all queries to ensure fresh data
      void queryClient.invalidateQueries();
      const entityLabel =
        entityKey.charAt(0).toUpperCase() + entityKey.slice(1);
      mantineShowSuccessNotification('', `${entityLabel} successfully created`);
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError,
  });
}
