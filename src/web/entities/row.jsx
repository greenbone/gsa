/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import withClickHandler from 'web/components/form/withClickHandler';

import Theme from 'web/utils/theme';

export const RowDetailsToggle = withClickHandler()(styled.span`
  cursor: pointer;
  text-decoration: none;
  color: ${Theme.blue};
  :hover {
    text-decoration: underline;
    color: ${Theme.blue};
  }
  @media print {
    color: ${Theme.black};
  }
`);

// vim: set ts=2 sw=2 tw=80:
