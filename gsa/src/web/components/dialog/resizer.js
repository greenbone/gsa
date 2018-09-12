/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
  border-top: 20px solid ${Theme.dialogGray};
`;

const ResizerBox = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
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
      <ResizerSymbol {...props}/>
    </ResizerBox>
  );
};

export default Resizer;

// vim: set ts=2 sw=2 tw=80:
