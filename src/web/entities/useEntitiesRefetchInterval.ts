/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState, useEffect} from 'react';
import type EntityModel from 'gmp/models/entity-model';
import {isDefined} from 'gmp/utils/identity';
import useGmp from 'web/hooks/useGmp';

interface UseEntitiesReloadIntervalOptions {
  useActive?: boolean;
}

/**
 * Hook to get the reload interval for entities based on their visibility and active state.
 *
 * @param options Options for configuring the reload interval behavior
 * @returns A function that calculates the reload interval based on the visibility and active state of the entities.
 */
const useEntitiesRefetchInterval = ({
  useActive = false,
}: UseEntitiesReloadIntervalOptions = {}) => {
  const gmp = useGmp();
  const gmpSettings = gmp.settings;
  const [isVisible, setIsVisible] = useState(() => !document.hidden);

  const handleVisibilityChange = useCallback(() => {
    setIsVisible(!document.hidden);
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleVisibilityChange]);

  return useCallback(
    (entities?: EntityModel[]) => {
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
    [isVisible, useActive, gmpSettings],
  );
};

export default useEntitiesRefetchInterval;
