/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useContext} from 'react';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';

const useCapabilities = () => useContext(CapabilitiesContext);

export default useCapabilities;
