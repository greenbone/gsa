/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import {useCallback} from 'react';
import useGmp from 'web/hooks/useGmp';

/**
 * Hook to get the reload interval for entities
 *
 * Can be best used in conjunction with useReload
 *
 * @example
 * const entities = [entity1, entity2];
 * const timeoutFunc = useEntitiesReloadInterval(entities);
 * const [startTimer, clearTimer, isRunning] = useReload(reloadFunc, timeoutFunc);
 *
 * @param {Array} entities Optional array of entities to consider
 * @param {Object} options Set useActive to true to consider the active state
 *   of the entities for the reload interval. If at least one entity is active
 *   the reload interval will be the active interval (shorter). If no entity is
 *   active the normal interval will be used. Default is false.
 * @returns Function A timeout function that calculates the reload interval
 */
const useEntitiesReloadInterval = (entities, {useActive = false} = {}) => {
  const gmp = useGmp();
  const gmpSettings = gmp.settings;
  const timeoutFunc = useCallback(
    ({isVisible}) => {
      if (!isVisible) {
        return gmpSettings.reloadIntervalInactive;
      }
      if (
        useActive &&
        isDefined(entities) &&
        entities.some(entity => entity.isActive())
      ) {
        return gmpSettings.reloadIntervalActive;
      }
      return gmpSettings.reloadInterval;
    },
    [entities, gmpSettings, useActive],
  );

  return timeoutFunc;
};

export default useEntitiesReloadInterval;
