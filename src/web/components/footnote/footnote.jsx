/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Layout from 'web/components/layout/layout';
import Theme from 'web/utils/theme';

const FootNote = styled(Layout)`
  font-size: 10px;
  color: ${Theme.mediumGray};
  text-align: left;
`;

export default FootNote;
