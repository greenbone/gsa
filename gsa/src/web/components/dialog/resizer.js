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

import styled from 'styled-components';

import Theme from 'web/utils/theme';

const ResizerSymbol = styled.div`
  width: 0;
  height: 0;
  cursor: nwse-resize;
  border-right: 20px solid transparent;
  border-bottom: 20px solid transparent;
  border-top: 20px solid ${Theme.white};
`;

const ResizerBox = styled.div`
  position: absolute;
  bottom: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  background: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 2px,
    ${Theme.black} 2px,
    ${Theme.black} 3px
  );
`;

const Resizer = props => {
  return (
    <ResizerBox>
      <ResizerSymbol {...props} />
    </ResizerBox>
  );
};

export default Resizer;

// vim: set ts=2 sw=2 tw=80:
