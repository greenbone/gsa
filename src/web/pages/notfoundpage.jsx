/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Logo from 'web/components/img/greenbone';
import Divider from 'web/components/layout/divider';

const StyledLogo = styled(Logo)`
  width: 300px;
`;

const PageNotFound = () => (
  <Divider flex="column" align={['center', 'center']} grow>
    <h1>{_('Page Not Found.')}</h1>
    <StyledLogo />
    <p>{_('We are sorry. The page you have requested could not be found.')}</p>
  </Divider>
);

export default PageNotFound;

// vim: set ts=2 sw=2 tw=80:
