/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';

const useCapabilities = () => {
  const capabilities = useContext(CapabilitiesContext);
  if (!capabilities) {
    throw new Error(
      'useCapabilities must be used within a CapabilitiesProvider',
    );
  }
  return capabilities;
};

export default useCapabilities;
