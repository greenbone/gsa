/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useDispatch} from 'react-redux';
import Rejection from 'gmp/http/rejection';
import {EntityType} from 'gmp/utils/entitytype';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {createDeleteEntity} from 'web/store/entities/utils/actions';

interface EntityDelete {
  // allow for current model classes to be used
  // id and name are currently optional but are always present in the model
  id?: string;
  name?: string;
}

interface EntityDeleteCallbacks<TDeleteError = unknown> {
  onDeleteError?: (error: TDeleteError) => void;
  onDeleted?: () => void;
}

/**
 * Custom hook to handle the deletion of an entity.
 *
 * @param {string} name - The name of the entity type to be deleted.
 * @param {EntityDeleteCallbacks} [callbacks] - Optional callbacks for handling delete events.
 * @returns A function to handle the deletion of an entity.
 */
const useEntityDelete = <
  TEntity extends EntityDelete = EntityDelete,
  TDeleteError = Rejection,
>(
  name: EntityType,
  {onDeleteError, onDeleted}: EntityDeleteCallbacks<TDeleteError> = {},
) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const deleteEntity = (entity: TEntity) =>
    // @ts-expect-error
    dispatch(createDeleteEntity({entityType: name})(gmp)(entity.id as string));

  const handleEntityDelete = async (entity: TEntity) => {
    return actionFunction<void, TDeleteError, void>(
      // @ts-expect-error
      deleteEntity(entity).then(() => {}),
      {
        onSuccess: onDeleted,
        onError: onDeleteError,
        successMessage: _('{{name}} deleted successfully.', {
          name: entity.name as string,
        }),
      },
    );
  };
  return handleEntityDelete;
};

export default useEntityDelete;
