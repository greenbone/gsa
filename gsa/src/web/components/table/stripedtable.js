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

import Theme from 'web/utils/theme';

import Table from './table';

import styled from 'styled-components';

const StripedTable = styled(Table)`
  & th,
  & td {
    padding: 4px 10px;
    border-bottom: 1px solid ${Theme.lightGray};
  }
  & tfoot tr {
    background: ${Theme.white};
  }
  & tfoot tr td {
    border-bottom: 1px solid ${Theme.lightGray};
  }
  @media screen {
    & > tbody:nth-of-type(even),
    & > tbody:only-of-type > tr:nth-of-type(even) {
      background: ${Theme.dialogGray};
    }
    & > tbody:not(:only-of-type):hover,
    & > tbody:only-of-type > tr:hover {
      background: ${Theme.lightGray};
    }
  }
`;

StripedTable.displayName = 'StripedTable';

export default StripedTable;

// vim: set ts=2 sw=2 tw=80:
