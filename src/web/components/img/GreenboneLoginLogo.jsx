/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import Img from 'web/components/img/Img';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

const OPENVAS_LOGO = 'greenbonehorizontal.svg';
const OPENVAS_SCAN_LOGO = 'greenbonehorizontal-scan.svg';

const Image = styled(Img)`
  display: flex;
  width: 300px;
`;

const LoginLogo = () => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const loginTopLogo = gmp?.settings?.vendorLabel
    ? OPENVAS_SCAN_LOGO
    : OPENVAS_LOGO;

  return (
    <Image
      alt={_('Greenbone AG')}
      data-testid="greenbone-login-logo"
      src={loginTopLogo}
    />
  );
};

export default LoginLogo;
