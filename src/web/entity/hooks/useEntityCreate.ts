/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Rejection from 'gmp/http/rejection';
import {isDefined} from 'gmp/utils/identity';
import actionFunction from 'web/entity/hooks/actionFunction';
import useGmp from 'web/hooks/useGmp';

interface EntityCreateCallbacks<
  TCreateResponse = unknown,
  TCreateError = Rejection,
> {
  onCreated?: (entity: TCreateResponse) => void;
  onCreateError?: (error: TCreateError) => void;
  onInteraction?: () => void;
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
  name: string,
  {
    onCreated,
    onCreateError,
    onInteraction,
  }: EntityCreateCallbacks<TCreateResponse, TCreateError> = {},
) => {
  const gmp = useGmp();
  const cmd = gmp[name] as {
    create: (data: TCreateData) => Promise<TCreateResponse>;
  };

  const handleInteraction = () => {
    if (isDefined(onInteraction)) {
      onInteraction();
    }
  };

  const handleEntitySave = async (data: TCreateData) => {
    handleInteraction();

    return actionFunction(cmd.create(data as TCreateData), {
      onSuccess: onCreated,
      onError: onCreateError,
    });
  };
  return handleEntitySave;
};

export default useEntityCreate;
