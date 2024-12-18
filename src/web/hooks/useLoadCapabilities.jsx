/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Capabilities from 'gmp/capabilities/capabilities';
import logger from 'gmp/log';
import {useEffect, useState} from 'react';
import useGmp from 'web/hooks/useGmp';

const log = logger.getLogger('web.useLoadCapabilities');

/**
 * Hook to load the user's capabilities from the backend
 */
const useLoadCapabilities = () => {
  const gmp = useGmp();
  const [capabilities, setCapabilities] = useState();

  useEffect(() => {
    gmp.user
      .currentCapabilities()
      .then(response => {
        const loadedCapabilities = response.data;
        log.debug('User capabilities', loadedCapabilities);
        setCapabilities(loadedCapabilities);
      })
      .catch(rejection => {
        if (rejection.isError()) {
          log.error(
            'An error occurred during fetching capabilities',
            rejection,
          );
        }
        // use empty capabilities
        setCapabilities(new Capabilities());
      });
  }, [gmp.user]);

  return capabilities;
};

export default useLoadCapabilities;
