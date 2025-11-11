/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  type EntityCommandParams,
  type EntityActionData,
} from 'gmp/commands/entity';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import actionFunction from 'web/entity/hooks/action-function';
import useTranslation from 'web/hooks/useTranslation';

interface EntityClone {
  // allow for current model classes to be used
  // id and name are currently optional but are always present in the model
  id?: string;
  name?: string;
}

export type EntityCloneResponse = Response<EntityActionData, XmlMeta>;

interface EntityCloneCallbacks<TCloneResponse = EntityCloneResponse> {
  onCloneError?: (error: Error) => void;
  onCloned?: (response: TCloneResponse) => void;
}

type EntityCloneFunction<TCloneResponse> = (
  entity: EntityCommandParams,
) => Promise<TCloneResponse>;
/**
 * Custom hook to handle the cloning of an entity.
 *
 * @param gmpMethod - A function that defines the GMP method to be used for cloning the entity.
 * @param callbacks - Optional callbacks for handling clone events.
 * @param callbacks.onCloneError - Callback function to be called when cloning fails.
 * @param callbacks.onCloned - Callback function to be called when cloning is successful.
 * @returns A function that takes an entity and handles its cloning.
 *
 * @example
 * ```typescript
 * const cloneEntity = useEntityClone(myCloneMethod, {
 *   onCloneError: (error) => console.error('Clone failed:', error),
 *   onCloned: (response) => console.log('Clone succeeded:', response),
 * });
 *
 * await cloneEntity(myEntity);
 * console.log('Cloning completed');
 * ```
 */
const useEntityClone = <
  TEntity extends EntityClone = EntityClone,
  TCloneResponse = EntityCloneResponse,
>(
  gmpMethod: EntityCloneFunction<TCloneResponse>,
  {onCloneError, onCloned}: EntityCloneCallbacks<TCloneResponse> = {},
) => {
  const [_] = useTranslation();

  return async (entity: TEntity) => {
    await actionFunction<TCloneResponse>(
      gmpMethod(entity as EntityCommandParams),
      {
        onSuccess: onCloned,
        onError: onCloneError,
        successMessage: _('{{name}} cloned successfully.', {
          name: entity.name as string,
        }),
      },
    );
  };
};

export default useEntityClone;
