/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import useLocale from 'web/hooks/useLocale';
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
  const [language] = useLocale();

  const linkHref =
    language === 'de'
      ? 'https://www.greenbone.net'
      : 'https://www.greenbone.net/en';

  return (
    <Footer>
      Copyright © 2009-2025 by Greenbone AG,&nbsp;
      <Link href={linkHref} rel="noopener noreferrer" target="_blank">
        www.greenbone.net
      </Link>
    </Footer>
  );
};

export default GreenboneFooter;
