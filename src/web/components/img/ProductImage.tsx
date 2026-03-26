/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Image from 'web/components/img/Image';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

const StyledImage = styled(Image)`
  display: flex;
  height: 180px;
`;

const ProductImage = () => {
  const [_] = useTranslation();
  const {settings} = useGmp();
  return (
    <StyledImage
      alt={_('OPENVAS SCAN')}
      src={
        isDefined(settings) && isDefined(settings.vendorLabel)
          ? settings.vendorLabel
          : 'login-label.svg'
      }
    />
  );
};

export default ProductImage;
