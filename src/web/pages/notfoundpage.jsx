/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import styled from 'styled-components';
import Logo from 'web/components/img/greenbone';

const StyledLogo = styled(Logo)`
  width: 300px;
  margin-bottom: 20px;
`;

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 80vh;
  width: 100%;
`;

const PageNotFound = () => (
  <CenteredDiv>
    <h1>{_('Page Not Found.')}</h1>
    <StyledLogo />
    <p>{_('We are sorry. The page you have requested could not be found.')}</p>
  </CenteredDiv>
);

export default PageNotFound;
