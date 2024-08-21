/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import styled from 'styled-components';

import Theme from 'web/utils/theme';

const DialogContent = styled.div`
  display: flex;
  flex-direction: column;
  height: inherit;
  padding: 0;
  background: ${Theme.white};
  box-shadow: 5px 5px 10px ${Theme.mediumGray};
  border-radius: 3px;
  border: 1px solid ${Theme.mediumGray};
`;

export default DialogContent;

// vim: set ts=2 sw=2 tw=80:
