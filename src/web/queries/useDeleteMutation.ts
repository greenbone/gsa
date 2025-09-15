/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useGmpMutation} from 'web/queries/useGmpMutation';

interface UseDeleteMutationParams<TOutput> {
  entityKey: string;
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteMutation<TInput = unknown, TOutput = unknown>({
  entityKey,
  method = 'delete',
  onSuccess,
  onError,
}: UseDeleteMutationParams<TOutput>) {
  const entityLabel = entityKey.charAt(0).toUpperCase() + entityKey.slice(1);

  return useGmpMutation<TInput, TOutput>({
    entityKey,
    method,
    successMessage: `${entityLabel} successfully deleted`,
    onSuccess,
    onError,
  });
}
