/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import GbLogo from 'web/components/icon/svg/greenbone.svg?url';

const GreenboneLogo = props => (
  <img alt="OPENVAS" {...props} data-testid="greenbone-logo" src={GbLogo} />
);

export default GreenboneLogo;
