/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';
import Features from 'gmp/capabilities/features';
import logger from 'gmp/log';
import useGmp from 'web/hooks/useGmp';

const log = logger.getLogger('web.useLoadFeatures');

/**
 * Hook to load the enabled features from the backend
 */
const useLoadFeatures = () => {
  const gmp = useGmp();
  const [features, setFeatures] = useState<Features>();

  useEffect(() => {
    gmp.user
      .currentFeatures()
      .then(response => {
        const loadedFeatures = response.data;
        log.debug('Enabled features', loadedFeatures);
        setFeatures(loadedFeatures);
      })
      .catch(rejection => {
        if (rejection.isError()) {
          log.error('An error occurred during fetching features', rejection);
        }
        // use empty capabilities
        setFeatures(new Features());
      });
  }, [gmp.user]);

  return features;
};

export default useLoadFeatures;
