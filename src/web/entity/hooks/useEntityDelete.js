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

/**
 * Custom hook to handle the deletion of an entity.
 *
 * @param {string} name - The name of the entity type to be deleted.
 * @param {Object} [callbacks] - Optional callbacks for handling delete events.
 * @param {Function} [callbacks.onDeleteError] - Callback function to be called if there is an error during deletion.
 * @param {Function} [callbacks.onDeleted] - Callback function to be called after the entity is successfully deleted.
 * @param {Function} [callbacks.onInteraction] - Callback function to be called during interaction.
 * @returns {Function} - A function to handle the deletion of an entity.
 */
const useEntityDelete = (
  name,
  {onDeleteError, onDeleted, onInteraction} = {},
) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const deleteEntity = entity =>
    dispatch(createDeleteEntity({entityType: name})(gmp)(entity.id));

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntityDelete = async entity => {
    handleInteraction();

    return actionFunction(
      deleteEntity(entity),
      onDeleted,
      onDeleteError,
      _('{{name}} deleted successfully.', {name: entity.name}),
    );
  };
  return handleEntityDelete;
};

export default useEntityDelete;
