/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Theme from 'web/utils/Theme';

const Link = styled.a`
  color: ${Theme.mediumGray};
  font-size: 10px;
  &:link {
    color: ${Theme.mediumGray};
  }
`;

const Footer = styled.footer`
  padding: 2px;
  font-size: 10px;
  text-align: center;
  color: ${Theme.mediumGray};
  margin-top: 10px;
`;

const GreenboneFooter = () => {
  return (
    <Footer>
      Copyright © 2009-2025 by Greenbone AG,&nbsp;
      <Link
        href="https://www.greenbone.net"
        rel="noopener noreferrer"
        target="_blank"
      >
        www.greenbone.net
      </Link>
    </Footer>
  );
};

export default GreenboneFooter;
