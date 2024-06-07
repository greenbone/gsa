/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled, {keyframes} from 'styled-components';

import Layout from 'web/components/layout/layout';

import GbLogo from 'web/components/icon/svg/greenbone.svg?url';

const Loader = styled.div`
  width: 80px;
  height: 80px;
  margin: 40px auto;
  background-image: url(${GbLogo});
  background-size: 90%;
  background-position: center;
  background-repeat: no-repeat;
  animation: ${keyframes({
      '0%, 100%': {
        transform: 'scale(0.9)',
        opacity: 0.2,
      },
      '50%': {
        transform: 'scale(1.0)',
        opacity: 1,
      },
    })}
    2s infinite ease-in-out;
`;

const StyledLayout = styled(Layout)`
  width: 100%;
`;

const Loading = () => (
  <StyledLayout data-testid="loading" align={['center', 'center']}>
    <Loader />
  </StyledLayout>
);

export default Loading;

// vim: set ts=2 sw=2 tw=80:
