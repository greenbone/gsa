/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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

import styled from 'styled-components';

import Theme from 'web/utils/theme';

const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 0;
  background: ${Theme.white};
  box-shadow: 5px 5px 10px ${Theme.mediumGray};
  border-radius: 3px;
  border: 1px solid ${Theme.mediumGray};
`;

export default DialogContent;

// vim: set ts=2 sw=2 tw=80:
