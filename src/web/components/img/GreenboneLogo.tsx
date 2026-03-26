/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import GbLogo from 'web/components/icon/svg/greenbone.svg?url';

const GreenboneLogo = () => (
  <img alt="Greenbone Logo" data-testid="greenbone-logo" src={GbLogo} />
);

export default GreenboneLogo;
