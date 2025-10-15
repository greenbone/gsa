/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {applianceComponent, type ApplianceLogo} from 'web/utils/applianceData';

const getLogo = (logo: ApplianceLogo) => {
  const Component =
    applianceComponent[logo] ?? applianceComponent['defaultVendorLabel'];
  return Component ? <Component /> : undefined;
};

export default getLogo;
