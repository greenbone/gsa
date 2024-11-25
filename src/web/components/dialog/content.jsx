/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 0;
  gap: 20px;
`;

export const StickyFooter = styled.div`
  position: sticky;
  bottom: 0;
  background-color: white;
  padding: 20px 0;
  z-index: 201;
  margin-bottom: 20;
`;

export default DialogContent;
