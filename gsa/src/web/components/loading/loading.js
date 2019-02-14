/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import styled, {keyframes} from 'styled-components';

import Layout from 'web/components/layout/layout';

import Theme from 'web/utils/theme';

const Loader = styled.div`
  border: 12px solid ${Theme.lightGray};
  border-top: 12px solid ${Theme.green};
  border-radius: 50%;
  width: 80px;
  height: 80px;
  animation: ${keyframes({
      '0%': {transform: 'rotate(0deg)'},
      '100%': {transform: 'rotate(360deg)'},
    })}
    2s linear infinite;
`;

const StyledLayout = styled(Layout)`
  width: 100%;
`;

const Loading = () => (
  <StyledLayout align={['center', 'center']}>
    <Loader />
  </StyledLayout>
);

export default Loading;

// vim: set ts=2 sw=2 tw=80:
