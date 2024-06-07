/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import styled from 'styled-components';

import Theme from 'web/utils/theme';

const DialogOverlay = styled.div`
  position: fixed;
  font-family: ${Theme.Font.dialog};
  font-size: 1.1em;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  margin: 0;
  background: rgba(102, 102, 102, 0.5);
  z-index: ${Theme.Layers.menu};
  transition: opacity 1s ease-in;
  width: 100%;
  height: 100%;
`;

export default DialogOverlay;

// vim: set ts=2 sw=2 tw=80:
