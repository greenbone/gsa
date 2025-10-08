/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityCommandParams} from 'gmp/commands/entity';
import {EntityType, typeName} from 'gmp/utils/entitytype';
import useTranslation from 'web/hooks/useTranslation';
import {useGmpMutation} from 'web/queries/useGmpMutation';

interface UseDeleteMutationParams<TOutput, TError> {
  entityType: EntityType;
  invalidateQueryIds?: string[];
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

export function useDeleteMutation<
  TInput = EntityCommandParams,
  TOutput = void,
  TError = Error,
>({
  entityType,
  invalidateQueryIds,
  method = 'delete',
  onSuccess,
  onError,
}: UseDeleteMutationParams<TOutput, TError>) {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput, TError>({
    entityType,
    invalidateQueryIds,
    method,
    successMessage: _('{{entity)} successfully deleted', {
      entity: typeName(entityType),
    }),
    onSuccess,
    onError,
  });
}
