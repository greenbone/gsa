/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import {hasValue} from 'gmp/utils/identity';

import {StyledMenuEntry} from 'web/components/menu/menu';

import Theme from 'web/utils/theme';

const MSection = styled.ul`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  border-top: 1px solid ${Theme.lightGray};
  padding: 0;
`;

const MenuSection = ({children}) => (
  <MSection>
    {React.Children.map(children, child =>
      hasValue(child) ? <StyledMenuEntry>{child}</StyledMenuEntry> : child,
    )}
  </MSection>
);

export default MenuSection;

// vim: set ts=2 sw=2 tw=80:
