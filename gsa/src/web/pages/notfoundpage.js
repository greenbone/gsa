/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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

import styled from 'styled-components';

import _ from 'gmp/locale';

import Logo from 'web/components/img/greenbone';
import Divider from 'web/components/layout/divider';

const StyledLogo = styled(Logo)`
  width: 300px;
`;

const PageNotFound = () => (
  <Divider flex="column" align={['center', 'center']} grow>
    <h1>{_('Page Not Found.')}</h1>
    <StyledLogo />
    <p>{_('We are sorry. The page you have requested could not be found.')}</p>
  </Divider>
);

export default PageNotFound;

// vim: set ts=2 sw=2 tw=80:
