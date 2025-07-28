/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Rejection from 'gmp/http/rejection';
import {isDefined} from 'gmp/utils/identity';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface EntityClone {
  // allow for current model classes to be used
  // id and name are currently optional but are always present in the model
  id?: string;
  name?: string;
}

interface EntityCloneCallbacks<
  TCloneResponse = unknown,
  TCloneError = Rejection | Error,
> {
  onCloneError?: (error: TCloneError) => void;
  onCloned?: (response: TCloneResponse) => void;
  onInteraction?: () => void;
}

/**
 * Custom hook to handle the cloning of an entity.
 *
 * @param {string} name - The name of the entity to be cloned.
 * @param {Object} [callbacks] - Optional callbacks for handling clone events.
 * @param {Function} [callbacks.onCloneError] - Callback function to be called when cloning fails.
 * @param {Function} [callbacks.onCloned] - Callback function to be called when cloning is successful.
 * @param {Function} [callbacks.onInteraction] - Callback function to be called on interaction.
 * @returns {Function} - A function that takes an entity and handles its cloning.
 */
const useEntityClone = <
  TEntity extends EntityClone = EntityClone,
  TCloneResponse = unknown,
  TCloneError = Rejection,
>(
  name: string,
  {
    onCloneError,
    onCloned,
    onInteraction,
  }: EntityCloneCallbacks<TCloneResponse, TCloneError> = {},
): ((entity: TEntity) => Promise<TCloneResponse | void>) => {
  const gmp = useGmp();
  const cmd = gmp[name] as {
    clone: (entity: TEntity) => Promise<TCloneResponse>;
  };
  const [_] = useTranslation();

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntityClone = async (entity: TEntity) => {
    handleInteraction();

    return actionFunction(cmd.clone(entity), {
      onSuccess: onCloned,
      onError: onCloneError,
      successMessage: _('{{name}} cloned successfully.', {
        name: entity?.name as string,
      }),
    });
  };
  return handleEntityClone;
};

export default useEntityClone;
