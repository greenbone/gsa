/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';
import GbLogo from 'web/components/icon/svg/greenbone.svg?url';

const GreenboneLogo = props => (
  <img alt="Greenbone Security Assistant" {...props} data-testid="greenbone-logo" src={GbLogo}/>
);

export default GreenboneLogo;

// vim: set ts=2 sw=2 tw=80:
