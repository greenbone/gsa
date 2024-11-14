/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import Img from './img';

const Image = styled(Img)`
  display: flex;
  width: 300px;
`;

const LoginLogo = props => {
  return (
    <Image alt={_('Greenbone AG')} src='greenbonehorizontal.png' data-testid="greenbone_logo_login"/>
  );
};

export default LoginLogo;

// vim: set ts=2 sw=2 tw=80:
