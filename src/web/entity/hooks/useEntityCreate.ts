/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Rejection from 'gmp/http/rejection';
import {type EntityType} from 'gmp/utils/entitytype';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';

interface EntityCreateCallbacks<
  TCreateResponse = unknown,
  TCreateError = Rejection,
> {
  onCreated?: (entity: TCreateResponse) => void;
  onCreateError?: (error: TCreateError) => void;
}

/**
 * Custom hook to handle creating an entity.
 *
 */
const useEntityCreate = <
  TCreateData = {},
  TCreateResponse = unknown,
  TCreateError = Rejection,
>(
  name: EntityType,
  {
    onCreated,
    onCreateError,
  }: EntityCreateCallbacks<TCreateResponse, TCreateError> = {},
) => {
  const gmp = useGmp();
  const cmd = gmp[name] as {
    create: (data: TCreateData) => Promise<TCreateResponse>;
  };

  const handleEntitySave = async (data: TCreateData) => {
    return actionFunction(cmd.create(data as TCreateData), {
      onSuccess: onCreated,
      onError: onCreateError,
    });
  };
  return handleEntitySave;
};

export default useEntityCreate;
