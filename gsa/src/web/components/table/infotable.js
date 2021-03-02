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

import styled from 'styled-components';

import SimpleTable from './simpletable';

const Table = styled(SimpleTable)`
  & td {
    padding: 4px 4px 4px 0;
  }
  & tr td:first-child {
    padding-right: 5px;
     {
      /* keep space between columns with low table width */
    }
  }
`;

export default Table;

// vim: set ts=2 sw=2 tw=80:
