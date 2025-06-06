/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Capabilities from 'gmp/capabilities/capabilities';

const CapabilitiesContext = React.createContext<Capabilities | undefined>(
  undefined,
);

export default CapabilitiesContext;
