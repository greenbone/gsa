/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityCommandParams} from 'gmp/commands/entity';
import {type EntityType, typeName} from 'gmp/utils/entitytype';
import useTranslation from 'web/hooks/useTranslation';
import useGmpMutation from 'web/queries/useGmpMutation';

interface UseDeleteMutationParams<TInput, TOutput, TError> {
  entityType: EntityType;
  gmpMethod: (input: TInput) => Promise<TOutput>;
  invalidateQueryIds?: string[];
  onSuccess?: (data: TOutput) => void;
  onError?: (error: TError) => void;
}

const useMoveToTrashCan = <
  TInput = EntityCommandParams,
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
    gmpMethod,
    invalidateQueryIds,
    successMessage: _('{{entity}} successfully moved to trashcan', {
      entity: typeName(entityType),
    }),
    onSuccess,
    onError,
  });
};

export default useMoveToTrashCan;
