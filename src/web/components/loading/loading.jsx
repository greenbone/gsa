/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import Layout from 'web/components/layout/layout';

import {Spinner} from '@greenbone/opensight-ui-components-mantinev7';

const StyledLayout = styled(Layout)`
  width: 100%;
`;

const Loading = () => (
  <StyledLayout data-testid="loading" align={['center', 'center']}>
    <Spinner />
  </StyledLayout>
);

export default Loading;

// vim: set ts=2 sw=2 tw=80:
