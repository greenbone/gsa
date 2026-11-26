/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {Spinner} from '@greenbone/ui-lib';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Layout from 'web/components/layout/Layout';

const StyledLayout = styled(Layout)`
  width: 100%;
`;

const Loading = ({label}: {label?: string}) => (
  <StyledLayout
    align={['center', 'center']}
    aria-label={label}
    data-testid="loading"
    role={!isDefined(label) ? undefined : 'status'}
  >
    <Spinner />
  </StyledLayout>
);

export default Loading;
