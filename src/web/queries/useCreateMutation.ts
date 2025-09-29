/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useGmpMutation} from 'web/queries/useGmpMutation';

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
  const entityLabel = entityKey.charAt(0).toUpperCase() + entityKey.slice(1);

  return useGmpMutation<TInput, TOutput>({
    entityKey,
    method,
    successMessage: `${entityLabel} successfully created`,
    onSuccess,
    onError,
  });
}
