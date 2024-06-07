/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import styled from 'styled-components';

import Theme from 'web/utils/theme';

const Link = styled.a`
  color: ${Theme.mediumGray};
  &:link {
    color: ${Theme.mediumGray};
  }
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 2px;
  font-size: 10px;
  text-align: right;
  color: ${Theme.mediumGray};
  margin-top: 10px;
  padding-right: 5px;
  z-index: ${Theme.Layers.aboveAll};
`;

const GreenboneFooter = () => {
  return (
    <Footer>
      Copyright © 2009-2024 by Greenbone AG,&nbsp;
      <Link
        target="_blank"
        rel="noopener noreferrer"
        href="http://www.greenbone.net"
      >
        www.greenbone.net
      </Link>
    </Footer>
  );
};

export default GreenboneFooter;

// vim: set ts=2 sw=2 tw=80:
