/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityActionData} from 'gmp/commands/entity';
import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import actionFunction from 'web/entity/hooks/action-function';

interface EntityCreateCallbacks<TCreateResponse> {
  onCreated?: (entity: TCreateResponse) => void;
  onCreateError?: (error: Error) => void;
}

type EntityCreateFunction<TCreateData, TCreateResponse> = (
  data: TCreateData,
) => Promise<TCreateResponse>;

export type EntityCreateResponse = Response<EntityActionData, XmlMeta>;

/**
 * Custom hook to handle creating an entity.
 *
 */
const useEntityCreate = <
  TCreateData = {},
  TCreateResponse = EntityCreateResponse,
>(
  gmpMethod: EntityCreateFunction<TCreateData, TCreateResponse>,
  {onCreated, onCreateError}: EntityCreateCallbacks<TCreateResponse> = {},
) => {
  const handleEntitySave = async (data: TCreateData) => {
    return actionFunction(gmpMethod(data), {
      onSuccess: onCreated,
      onError: onCreateError,
    });
  };
  return handleEntitySave;
};

export default useEntityCreate;
