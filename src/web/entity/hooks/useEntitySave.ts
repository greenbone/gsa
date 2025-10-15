/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityType} from 'gmp/utils/entitytype';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';

interface EntitySaveCallbacks<TSaveResponse = unknown, TSaveError = unknown> {
  onSaveError?: (error: TSaveError) => void;
  onSaved?: (response: TSaveResponse) => void;
}

/**
 * Custom hook to handle saving or creating an entity.
 *
 */
const useEntitySave = <
  TSaveData = {},
  TSaveResponse = unknown,
  TSaveError = unknown,
>(
  name: EntityType,
  {onSaveError, onSaved}: EntitySaveCallbacks<TSaveResponse, TSaveError> = {},
) => {
  const gmp = useGmp();
  const cmd = gmp[name] as {
    save: (data: TSaveData) => Promise<TSaveResponse>;
  };

  const handleEntitySave = async (data: TSaveData) => {
    return actionFunction(cmd.save(data as TSaveData), {
      onSuccess: onSaved,
      onError: onSaveError,
    });
  };
  return handleEntitySave;
};

export default useEntitySave;
