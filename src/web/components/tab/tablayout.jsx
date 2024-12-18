/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';

import Layout from '../../components/layout/layout';
import Theme from '../../utils/theme';

const TabLayout = styled(Layout)`
  border-bottom: 2px solid ${Theme.green};
  margin-top: 30px;
  margin-bottom: 15px;
`;

export default TabLayout;
