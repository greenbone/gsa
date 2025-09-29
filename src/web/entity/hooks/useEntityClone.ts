/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {EntityActionData} from 'gmp/commands/entity';
import Rejection from 'gmp/http/rejection';
import Response from 'gmp/http/response';
import {XmlMeta} from 'gmp/http/transform/fastxml';
import {EntityType} from 'gmp/utils/entitytype';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

interface EntityClone {
  // allow for current model classes to be used
  // id and name are currently optional but are always present in the model
  id?: string;
  name?: string;
}

type EntityCloneResponse = Response<EntityActionData, XmlMeta>;

interface EntityCloneCallbacks<
  TCloneResponse = EntityCloneResponse,
  TCloneError = Rejection | Error,
> {
  onCloneError?: (error: TCloneError) => void;
  onCloned?: (response: TCloneResponse) => void;
}

/**
 * Custom hook to handle the cloning of an entity.
 *
 * @param {string} name - The name of the entity to be cloned.
 * @param {Object} [callbacks] - Optional callbacks for handling clone events.
 * @param {Function} [callbacks.onCloneError] - Callback function to be called when cloning fails.
 * @param {Function} [callbacks.onCloned] - Callback function to be called when cloning is successful.
 * @returns {Function} - A function that takes an entity and handles its cloning.
 */
const useEntityClone = <
  TEntity extends EntityClone = EntityClone,
  TCloneResponse = EntityCloneResponse,
  TCloneError = Rejection,
>(
  name: EntityType,
  {
    onCloneError,
    onCloned,
  }: EntityCloneCallbacks<TCloneResponse, TCloneError> = {},
): ((entity: TEntity) => Promise<TCloneResponse | void>) => {
  const gmp = useGmp();
  const cmd = gmp[name] as {
    clone: (entity: TEntity) => Promise<TCloneResponse>;
  };
  const [_] = useTranslation();

  const handleEntityClone = async (entity: TEntity) => {
    return actionFunction<TCloneResponse, TCloneError>(cmd.clone(entity), {
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
