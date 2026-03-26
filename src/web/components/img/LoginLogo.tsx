/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import Image from 'web/components/img/Image';
import useGmp from 'web/hooks/useGmp';

const OPENVAS_LOGO = 'openvasHorizontal.svg';
const OPENVAS_SCAN_LOGO = 'openvasHorizontal-scan.svg';

const StyledImage = styled(Image)`
  display: flex;
  width: 300px;
`;

const LoginLogo = () => {
  const gmp = useGmp();
  const loginTopLogo = gmp?.settings?.vendorLabel
    ? OPENVAS_SCAN_LOGO
    : OPENVAS_LOGO;

  return (
    <StyledImage
      alt={gmp.settings.vendorLabel ? 'OPENVAS SCAN' : 'OPENVAS'}
      data-testid="login-logo"
      src={loginTopLogo}
    />
  );
};

export default LoginLogo;
