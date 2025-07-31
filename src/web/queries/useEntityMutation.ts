/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import useGmp from 'web/hooks/useGmp';

interface UseEntityMutationParams<TOutput> {
  entityKey: string;
  method?: 'create' | 'save' | 'delete' | 'clone' | 'import';
  onSuccess?: (data: TOutput) => void;
  onError?: (error: unknown) => void;
  successMessage?: string;
  /**
   * Whether to show a success notification. Defaults to true.
   */
  showNotification?: boolean;
}

/**
 * A generic hook for entity mutations (create, save, delete, etc.) using TanStack Query
 */
export const useEntityMutation = <TInput = unknown, TOutput = unknown>({
  entityKey,
  method = 'create',
  onSuccess,
  onError,
  successMessage,
  showNotification = true,
}: UseEntityMutationParams<TOutput>) => {
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
    onSuccess: data => {
      // Invalidate all queries to ensure fresh data
      void queryClient.invalidateQueries();

      // Show success notification if enabled
      if (showNotification) {
        if (successMessage) {
          mantineShowSuccessNotification('', successMessage);
        } else {
          const entityLabel =
            entityKey.charAt(0).toUpperCase() + entityKey.slice(1);
          let actionLabel: string;
          switch (method) {
            case 'create':
              actionLabel = 'created';
              break;
            case 'save':
              actionLabel = 'saved';
              break;
            case 'delete':
              actionLabel = 'deleted';
              break;
            case 'clone':
              actionLabel = 'cloned';
              break;
            case 'import':
              actionLabel = 'imported';
              break;
            default:
              actionLabel = 'processed';
          }
          mantineShowSuccessNotification(
            '',
            `${entityLabel} successfully ${actionLabel}`,
          );
        }
      }

      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError,
  });
};

/**
 * Hook for creating entities (alias for useEntityMutation with method='create')
 */
export const useCreateMutation = <TInput = unknown, TOutput = unknown>(
  params: Omit<UseEntityMutationParams<TOutput>, 'method'>,
) => {
  return useEntityMutation<TInput, TOutput>({
    ...params,
    method: 'create',
  });
};

/**
 * Hook for saving entities (alias for useEntityMutation with method='save')
 */
export const useSaveMutation = <TInput = unknown, TOutput = unknown>(
  params: Omit<UseEntityMutationParams<TOutput>, 'method'>,
) => {
  return useEntityMutation<TInput, TOutput>({
    ...params,
    method: 'save',
  });
};
