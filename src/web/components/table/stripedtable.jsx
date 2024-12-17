/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Theme from 'web/utils/theme';

import Table from './table';


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
    padding: 15px 0;
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
