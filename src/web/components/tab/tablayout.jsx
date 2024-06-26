/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import styled from 'styled-components';

import Theme from '../../utils/theme';

import Layout from '../../components/layout/layout';

const TabLayout = styled(Layout)`
  border-bottom: 2px solid ${Theme.green};
  margin-top: 30px;
  margin-bottom: 15px;
`;

export default TabLayout;

// vim: set ts=2 sw=2 tw=80:
