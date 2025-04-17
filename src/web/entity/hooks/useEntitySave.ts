/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';

interface EntitySave {
  id?: string;
}

interface EntitySaved {
  id: string;
}

interface SaveCallbacks {
  onSaveError?: (error: unknown) => void;
  onSaved?: (entity: EntitySaved) => void;
  onCreated?: (entity: EntitySaved) => void;
  onCreateError?: (error: unknown) => void;
  onInteraction?: () => void;
}

/**
 * Custom hook to handle saving or creating an entity.
 *
 * @param {string} name - The name of the entity.
 * @param {SaveCallbacks} [callbacks={}] - Optional callbacks for various save events.
 * @param {Function} [callbacks.onSaveError] - Callback function to be called on save error.
 * @param {Function} [callbacks.onSaved] - Callback function to be called when the entity is saved.
 * @param {Function} [callbacks.onCreated] - Callback function to be called when the entity is created.
 * @param {Function} [callbacks.onCreateError] - Callback function to be called on create error.
 * @param {Function} [callbacks.onInteraction] - Callback function to be called on interaction.
 * @returns {Function} - A function to handle saving the entity. The function takes an entity as an argument.
 *                       If the entity has an id, it will be saved, otherwise it will be created.
 */
const useEntitySave = (
  name: string,
  {
    onSaveError,
    onSaved,
    onCreated,
    onCreateError,
    onInteraction,
  }: SaveCallbacks = {},
) => {
  const gmp = useGmp();
  const cmd = gmp[name];

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntitySave = async (data: EntitySave) => {
    handleInteraction();

    if (isDefined(data.id)) {
      return actionFunction(cmd.save(data), onSaved, onSaveError);
    }

    return actionFunction(cmd.create(data), onCreated, onCreateError);
  };
  return handleEntitySave;
};

export default useEntitySave;
