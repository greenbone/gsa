/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Spinner} from '@greenbone/opensight-ui-components-mantinev7';
import React from 'react';
import styled from 'styled-components';
import Layout from 'web/components/layout/Layout';

const StyledLayout = styled(Layout)`
  width: 100%;
`;

const Loading = () => (
  <StyledLayout align={['center', 'center']} data-testid="loading">
    <Spinner />
  </StyledLayout>
);

export default Loading;
