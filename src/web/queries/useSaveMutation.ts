/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityType, typeName} from 'gmp/utils/entitytype';
import useTranslation from 'web/hooks/useTranslation';
import {useGmpMutation} from 'web/queries/useGmpMutation';

interface UseSaveMutationParams<TOutput, TError> {
  entityType: EntityType;
  invalidateQueryIds?: string[];
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

export function useSaveMutation<
  TInput = unknown,
  TOutput = unknown,
  TError = Error,
>({
  entityType,
  invalidateQueryIds,
  method = 'save',
  onSuccess,
  onError,
}: UseSaveMutationParams<TOutput, TError>) {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput, TError>({
    entityType,
    invalidateQueryIds,
    method,
    successMessage: _('{{entity}} successfully saved', {
      entity: typeName(entityType),
    }),
    onSuccess,
    onError,
  });
}
