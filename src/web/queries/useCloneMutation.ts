/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import {type EntityType, typeName} from 'gmp/utils/entity-type';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

export interface CloneMutationInput extends EntityCommandParams {
  name?: string;
}

interface UseCloneMutationParams<TOutput, TError> {
  gmpMethod: (entity: EntityCommandParams) => Promise<TOutput>;
  entityType: EntityType;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useCloneMutation = <TOutput = unknown, TError = Error>({
  gmpMethod,
  entityType,
  invalidateQueryIds,
  onSuccess,
  onError,
}: UseCloneMutationParams<TOutput, TError>) => {
  const [_] = useTranslation();
  return useGmpMutation<CloneMutationInput, TOutput, TError>({
    gmpMethod: ({id}) => gmpMethod({id}),
    invalidateQueryIds,
    successMessage: (_data, variables) =>
      variables.name
        ? _('{{entity}} {{- name}} cloned successfully', {
            entity: typeName(entityType),
            name: variables.name,
          })
        : _('{{entity}} cloned successfully', {
            entity: typeName(entityType),
          }),
    onSuccess,
    onError,
  });
};

export default useCloneMutation;
