/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {css} from 'styled-components';

const updatingStyle = css<{$isUpdating?: boolean}>`
  opacity: ${props => (props.$isUpdating ? '0.1' : '1.0')};
  transition: opacity 0.3s ease;
`;

export default updatingStyle;
