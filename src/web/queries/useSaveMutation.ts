/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useGmpMutation} from 'web/queries/useGmpMutation';

interface UseSaveMutationParams<TOutput> {
  entityKey: string;
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: unknown) => void;
}

export function useSaveMutation<TInput = unknown, TOutput = unknown>({
  entityKey,
  method = 'save',
  onSuccess,
  onError,
}: UseSaveMutationParams<TOutput>) {
  const entityLabel = entityKey.charAt(0).toUpperCase() + entityKey.slice(1);

  return useGmpMutation<TInput, TOutput>({
    entityKey,
    method,
    successMessage: `${entityLabel} successfully saved`,
    onSuccess,
    onError,
  });
}
