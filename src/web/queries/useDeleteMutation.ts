/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import {type EntityType, typeName} from 'gmp/utils/entity-type';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

export interface DeleteMutationInput extends EntityCommandParams {
  name: string | undefined;
}

interface UseDeleteMutationParams<TInput, TOutput, TError> {
  entityType: EntityType;
  gmpMethod: (input: TInput) => Promise<TOutput>;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useDeleteMutation = <
  TInput extends object = DeleteMutationInput,
  TOutput = void,
  TError = Error,
>({
  gmpMethod,
  entityType,
  invalidateQueryIds,
  onSuccess,
  onError,
}: UseDeleteMutationParams<TInput, TOutput, TError>) => {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput, TError>({
    gmpMethod: (data: TInput) => gmpMethod(data),
    invalidateQueryIds,
    successMessage: (_data, variables) =>
      'name' in variables && variables.name
        ? _('{{entity}} {{- name}} successfully deleted', {
            entity: typeName(entityType),
            name: variables.name as string,
          })
        : _('{{entity}} successfully deleted', {
            entity: typeName(entityType),
          }),
    onSuccess,
    onError,
  });
};

export default useDeleteMutation;
