/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Capabilities from 'gmp/capabilities/capabilities.js';

class EverythingCapabilities extends Capabilities {
  constructor() {
    super(['everything']);
  }
}

export default EverythingCapabilities;
