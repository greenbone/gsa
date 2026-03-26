/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import {type EntityType, typeName} from 'gmp/utils/entity-type';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

export interface MoveToTrashCanInput extends EntityCommandParams {
  name?: string;
}

interface UseMoveToTrashCanParams<TOutput, TError> {
  entityType: EntityType;
  gmpMethod: (input: EntityCommandParams) => Promise<TOutput>;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useMoveToTrashCan = <TOutput = void, TError = Error>({
  gmpMethod,
  entityType,
  invalidateQueryIds,
  onSuccess,
  onError,
}: UseMoveToTrashCanParams<TOutput, TError>) => {
  const [_] = useTranslation();
  return useGmpMutation<MoveToTrashCanInput, TOutput, TError>({
    gmpMethod: ({id}) => gmpMethod({id}),
    invalidateQueryIds,
    successMessage: (_data, variables) =>
      variables.name
        ? _('{{- entity}} {{- name}} successfully moved to trashcan', {
            entity: typeName(entityType),
            name: variables.name,
          })
        : _('{{- entity}} successfully moved to trashcan', {
            entity: typeName(entityType),
          }),
    onSuccess,
    onError,
  });
};

export default useMoveToTrashCan;
