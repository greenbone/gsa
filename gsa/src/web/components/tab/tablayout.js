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

import styled from 'styled-components';

import Layout from 'web/components/layout/layout';

import Theme from 'web/utils/theme';

const TabLayout = styled(Layout)`
  border-bottom: 2px solid ${Theme.green};
  margin-top: 30px;
  margin-bottom: 15px;
`;

export default TabLayout;

// vim: set ts=2 sw=2 tw=80:
