/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import styled from 'styled-components';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import withGmp from 'web/utils/withGmp';
import PropTypes from 'web/utils/proptypes';

import Img from './img';

const Image = styled(Img)`
  display: flex;
  height: 95px;
`;

const ProductImage = ({gmp, ...props}) => (
  <Image
    alt={_('Greenbone Security Assistant')}
    {...props}
    src={
      isDefined(gmp.settings) && isDefined(gmp.settings.vendorLabel)
        ? gmp.settings.vendorLabel
        : 'login-label.png'
    }
  />
);

ProductImage.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(ProductImage);

// vim: set ts=2 sw=2 tw=80:
