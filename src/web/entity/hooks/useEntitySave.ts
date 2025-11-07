/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Response from 'gmp/http/response';
import {type XmlMeta} from 'gmp/http/transform/fast-xml';
import type ActionResult from 'gmp/models/action-result';
import actionFunction from 'web/entity/hooks/action-function';

interface EntitySaveCallbacks<TSaveResponse = unknown> {
  onSaveError?: (error: Error) => void;
  onSaved?: (response: TSaveResponse) => void;
}

type EntitySaveFunction<TSaveData, TSaveResponse> = (
  data: TSaveData,
) => Promise<TSaveResponse>;

/**
 * Custom hook to handle saving or creating an entity.
 *
 */

const useEntitySave = <
  TSaveData = {},
  TSaveResponse = Response<ActionResult, XmlMeta>,
>(
  gmpMethod: EntitySaveFunction<TSaveData, TSaveResponse>,
  {onSaveError, onSaved}: EntitySaveCallbacks<TSaveResponse> = {},
) => {
  const handleEntitySave = async (data: TSaveData) => {
    return actionFunction(gmpMethod(data), {
      onSuccess: onSaved,
      onError: onSaveError,
    });
  };
  return handleEntitySave;
};

export default useEntitySave;
