/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
