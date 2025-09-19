/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showSuccessNotification as mantineShowSuccessNotification} from '@greenbone/ui-lib';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {pluralizeType} from 'gmp/utils/entitytype';
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

  const mutatingOperations = [
    'create',
    'modify',
    'delete',
    'save',
    'start',
    'stop',
    'resume',
    'move',
    'empty',
    'restore',
    'sync',
    'test',
    'verify',
    'run',
  ];

  const shouldInvalidateQueries =
    invalidateQueries && mutatingOperations.some(op => method.startsWith(op));

  return useMutation<TOutput, unknown, TInput>({
    mutationFn: async (input: TInput) => {
      if (!gmpEntity || !gmpCommand) {
        throw new Error(`GMP command for ${entityKey}.${method} not found`);
      }
      return await gmpCommand.call(gmpEntity, input);
    },
    onSuccess: data => {
      if (shouldInvalidateQueries) {
        /*
         * TODO test cache invalidation based on useGetQuery cmd queryKey: [cmd, token, filter]
         * Invalidate queries for the specific entity type (e.g., get_agents, get_users)
         * Transform entityKey using the same logic as useGetQuery
         */

        const pluralEntityKey = pluralizeType(entityKey).replace(/_/g, '');
        const getCommand = `get_${pluralEntityKey}`;
        void queryClient.invalidateQueries({
          predicate: query => {
            const [cmd] = query.queryKey as [string, ...unknown[]];
            return cmd === getCommand;
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
