/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import useGmp from 'web/hooks/useGmp';

import Img from './img';

const Image = styled(Img)`
  display: flex;
  height: 180px;
`;

const ProductImage = props => {
  const {settings} = useGmp();
  return (
    <Image
      alt={_('Greenbone Security Assistant')}
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

// vim: set ts=2 sw=2 tw=80:
