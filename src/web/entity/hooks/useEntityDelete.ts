/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useDispatch} from 'react-redux';
import {type EntityCommandParams} from 'gmp/commands/entity';
import {type EntityType} from 'gmp/utils/entity-type';
import actionFunction from 'web/entity/hooks/action-function';
import useTranslation from 'web/hooks/useTranslation';
import {entityDeleteActions} from 'web/store/entities/utils/actions';

interface EntityDeleteCallbacks {
  onDeleteError?: (error: Error) => void;
  onDeleted?: () => void;
}

type EntityDeleteFunction = (entity: EntityCommandParams) => Promise<void>;

interface EntityDelete {
  // allow for current model classes to be used
  // id and name are currently optional but are always present in the model
  id?: string;
  name?: string;
  entityType: EntityType;
}

/**
 * Custom hook to handle the deletion of an entity.
 *
 * @param gmpMethod - A function that performs the deletion of the entity.
 * @param callbacks - Optional callbacks for handling delete events.
 *
 * @returns A function to handle the deletion of an entity.
 */
const useEntityDelete = <TEntity extends EntityDelete = EntityDelete>(
  gmpMethod: EntityDeleteFunction,
  {onDeleteError, onDeleted}: EntityDeleteCallbacks = {},
) => {
  const [_] = useTranslation();
  const dispatch = useDispatch();
  const deleteEntity = async (entity: TEntity) => {
    await gmpMethod({id: entity.id as string});
    const action = entityDeleteActions.success(entity.entityType, entity.id);
    dispatch(action);
  };

  const handleEntityDelete = async (entity: TEntity) => {
    return actionFunction<void, Error, void>(deleteEntity(entity), {
      onSuccess: onDeleted,
      onError: onDeleteError,
      successMessage: _('{{name}} deleted successfully.', {
        name: entity.name as string,
      }),
    });
  };
  return handleEntityDelete;
};

export default useEntityDelete;
