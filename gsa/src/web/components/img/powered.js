/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import Logo from 'web/components/icon/svg/greenbone-power.svg';

const GreenbonePowerLogo = props => (
  // eslint-disable-next-line react/jsx-no-target-blank
  <a href="https://www.greenbone.net" target="_blank" rel="noopener">
    <img alt="Powered By Greenbone Networks" {...props} src={Logo} />
  </a>
);

export default GreenbonePowerLogo;
