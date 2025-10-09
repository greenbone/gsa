/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityType, typeName} from 'gmp/utils/entitytype';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseCreateMutationParams<TInput, TOutput, TError> {
  gmpMethod: (input: TInput) => Promise<TOutput>;
  entityType: EntityType;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useCreateMutation = <
  TInput = unknown,
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
    successMessage: _('{{entity}} successfully created', {
      entity: typeName(entityType),
    }),
    onSuccess,
    onError,
  });
};

export default useCreateMutation;
