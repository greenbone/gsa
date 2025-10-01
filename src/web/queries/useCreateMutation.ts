/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityType, typeName} from 'gmp/utils/entitytype';
import useTranslation from 'web/hooks/useTranslation';
import {useGmpMutation} from 'web/queries/useGmpMutation';

interface UseCreateMutationParams<TOutput, TError> {
  entityType: EntityType;
  invalidateQueryIds?: string[];
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

export function useCreateMutation<
  TInput = unknown,
  TOutput = unknown,
  TError = Error,
>({
  entityType,
  invalidateQueryIds,
  method = 'create',
  onSuccess,
  onError,
}: UseCreateMutationParams<TOutput, TError>) {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput, TError>({
    entityType,
    invalidateQueryIds,
    method,
    successMessage: _('{{entity}} successfully created', {
      entity: typeName(entityType),
    }),
    onSuccess,
    onError,
  });
}
