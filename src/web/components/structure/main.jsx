/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import withLayout from 'web/components/layout/withLayout';

const Main = styled.main`
  padding: 5px 10px;
  height: 100%;
  padding-bottom: 20px;
`;

Main.displayName = 'Main';

export default withLayout({
  flex: 'column',
  align: 'start',
})(Main);

// vim: set ts=2 sw=2 tw=80:
