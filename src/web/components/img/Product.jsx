/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import Img from 'web/components/img/Img';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

const Image = styled(Img)`
  display: flex;
  height: 180px;
`;

const ProductImage = props => {
  const [_] = useTranslation();
  const {settings} = useGmp();
  return (
    <Image
      alt={_('OPENVAS SCAN')}
      {...props}
      src={
        isDefined(settings) && isDefined(settings.vendorLabel)
          ? settings.vendorLabel
          : 'login-label.svg'
      }
    />
  );
};

export default ProductImage;
