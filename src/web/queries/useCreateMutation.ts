/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityType, typeName} from 'gmp/utils/entity-type';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

export interface CreateMutationInput {
  name: string | undefined;
}

interface UseCreateMutationParams<TInput, TOutput, TError> {
  gmpMethod: (input: TInput) => Promise<TOutput>;
  entityType: EntityType;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useCreateMutation = <
  TInput extends object = CreateMutationInput,
  TOutput = unknown,
  TError = Error,
>({
  gmpMethod,
  entityType,
  invalidateQueryIds,
  onSuccess,
  onError,
}: UseCreateMutationParams<TInput, TOutput, TError>) => {
  const [_] = useTranslation();
  return useGmpMutation<TInput, TOutput, TError>({
    gmpMethod,
    invalidateQueryIds,
    successMessage: (_data, variables) => {
      return 'name' in variables && variables.name
        ? _('{{entity}} {{- name}} successfully created', {
            entity: typeName(entityType),
            name: variables.name as string,
          })
        : _('{{entity}} successfully created', {
            entity: typeName(entityType),
          });
    },
    onSuccess,
    onError,
  });
};

export default useCreateMutation;
