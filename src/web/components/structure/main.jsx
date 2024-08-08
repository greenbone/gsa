/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

const Main = styled.main`
  padding: 15px;
  height: calc(-48px + 100vh);
  padding-bottom: 20px;
  overflow-y: auto;
  display: flex;
  flex-basis: 100%;
  flex-direction: column;
  justify-content: flex-start;
`;

Main.displayName = 'Main';

export default Main;
