/* Copyright (C) 2016-2020 Greenbone Networks GmbH
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

const Link = styled.a`
  color: ${Theme.mediumGray};
  &:link {
    color: ${Theme.green};
  }
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 2px;
  font-size: 10px;
  text-align: right;
  color: ${Theme.mediumGray};
  margin-top: 10px;
  padding-right: 5px;
  z-index: ${Theme.Layers.aboveAll};
`;

const GreenboneFooter = () => {
  return (
    <Footer>
      Greenbone Security Assistant (GSA) Copyright (C) 2009-2021 by Greenbone
      Networks GmbH,&nbsp;
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href="http://www.greenbone.net"
      >
        www.greenbone.net
      </Link>
    </Footer>
  );
};

export default GreenboneFooter;

// vim: set ts=2 sw=2 tw=80:
