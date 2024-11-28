/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import Theme from 'web/utils/theme';

const TableHeader = styled.thead`
  & a {
    text-decoration: none;
    color: ${Theme.black};
  }

  & a:hover {
    text-decoration: underline;
    color: ${Theme.black};
  }

  @media print {
    border-bottom: 1px solid black;

    & a,
    & a:hover {
      text-decoration: none;
      color: ${Theme.black};
    }
  }
`;

export default TableHeader;

// vim: set ts=2 sw=2 tw=80:
