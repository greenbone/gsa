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

import styled, {keyframes} from 'styled-components';

import Layout from 'web/components/layout/layout';

import GbLogo from 'web/components/icon/svg/greenbone.svg';

const Loader = styled.div`
  width: 80px;
  height: 80px;
  margin: 40px auto;
  background-image: url(${GbLogo});
  background-size: 90%;
  background-position: center;
  background-repeat: no-repeat;
  animation: ${keyframes({
      '0%, 100%': {
        transform: 'scale(0.9)',
        opacity: 0.2,
      },
      '50%': {
        transform: 'scale(1.0)',
        opacity: 1,
      },
    })}
    2s infinite ease-in-out;
`;

const StyledLayout = styled(Layout)`
  width: 100%;
`;

const Loading = () => (
  <StyledLayout data-testid="loading" align={['center', 'center']}>
    <Loader />
  </StyledLayout>
);

export default Loading;

// vim: set ts=2 sw=2 tw=80:
