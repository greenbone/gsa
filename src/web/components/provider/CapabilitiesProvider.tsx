/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Capabilities from 'gmp/capabilities/capabilities';
import React from 'react';

const CapabilitiesContext = React.createContext<Capabilities | undefined>(
  undefined,
);

export default CapabilitiesContext;
