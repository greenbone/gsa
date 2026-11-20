/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Capabilities from 'gmp/capabilities/capabilities';
import type Features from 'gmp/capabilities/features';

export const mayAccessActiveDirectory = (
  capabilities: Capabilities,
  features: Features,
) =>
  features.featureEnabled('ENABLE_AD_INTEGRATION') &&
  capabilities.mayOp('get_active_directory_objects') &&
  capabilities.mayAccess('credential');
