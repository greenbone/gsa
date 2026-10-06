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

interface UseDeleteMutationParams<
  TOutput,
  TError,
  TInput extends DeleteMutationInput,
> {
  entityType: EntityType;
  gmpMethod: (input: TInput) => Promise<TOutput>;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useDeleteMutation = <
  TOutput = void,
  TError = Error,
  TInput extends DeleteMutationInput = DeleteMutationInput,
>({
  gmpMethod,
  entityType,
  invalidateQueryIds,
  onSuccess,
  onError,
}: UseDeleteMutationParams<TOutput, TError, TInput>) => {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput, TError>({
    gmpMethod: (data: TInput) => gmpMethod(data),
    invalidateQueryIds,
    successMessage: (_data, variables) =>
      variables.name
        ? _('{{entity}} {{- name}} successfully deleted', {
            entity: typeName(entityType),
            name: variables.name,
          })
        : _('{{entity}} successfully deleted', {
            entity: typeName(entityType),
          }),
    onSuccess,
    onError,
  });
};

export default useDeleteMutation;
