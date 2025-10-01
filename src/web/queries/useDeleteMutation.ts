/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityCommandParams} from 'gmp/commands/entity';
import {EntityType, typeName} from 'gmp/utils/entitytype';
import useTranslation from 'web/hooks/useTranslation';
import {useGmpMutation} from 'web/queries/useGmpMutation';

interface UseDeleteMutationParams<TOutput> {
  entityType: EntityType;
  invalidateQueryIds?: string[];
  method?: string;
  onSuccess?: (data: TOutput) => void;
  onError?: (error: unknown) => void;
}

export function useDeleteMutation<
  TInput = EntityCommandParams,
  TOutput = void,
>({
  entityType,
  invalidateQueryIds,
  method = 'delete',
  onSuccess,
  onError,
}: UseDeleteMutationParams<TOutput>) {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput>({
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
