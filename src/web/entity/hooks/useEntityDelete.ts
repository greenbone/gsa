/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useDispatch} from 'react-redux';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {createDeleteEntity} from 'web/store/entities/utils/actions';

interface EntityDelete {
  id: string;
  name: string;
}

interface DeleteCallbacks {
  onDeleteError?: (error: unknown) => void;
  onDeleted?: () => void;
  onInteraction?: () => void;
}

/**
 * Custom hook to handle the deletion of an entity.
 *
 * @param {string} name - The name of the entity type to be deleted.
 * @param {DeleteCallbacks} [callbacks] - Optional callbacks for handling delete events.
 * @returns {Function} - A function to handle the deletion of an entity.
 */
const useEntityDelete = (
  name: string,
  {onDeleteError, onDeleted, onInteraction}: DeleteCallbacks = {},
) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const deleteEntity = (entity: EntityDelete) =>
    // @ts-expect-error
    dispatch(createDeleteEntity({entityType: name})(gmp)(entity.id));

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntityDelete = async (entity: EntityDelete) => {
    handleInteraction();

    return actionFunction(
      // @ts-expect-error
      deleteEntity(entity),
      onDeleted,
      onDeleteError,
      _('{{name}} deleted successfully.', {name: entity.name}),
    );
  };
  return handleEntityDelete;
};

export default useEntityDelete;
