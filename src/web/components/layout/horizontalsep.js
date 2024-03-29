/* Copyright (C) 2017-2022 Greenbone AG
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
import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';

import Divider from './divider';
import {styledExcludeProps} from 'web/utils/styledConfig';

const HorizontalSep = styledExcludeProps(styled(Divider), [
  'separator',
  'spacing',
  'wrap',
])`
  flex-wrap: ${props => (isDefined(props.wrap) ? props.wrap : null)};
  & > *:not(:last-child)::after {
    content: ${({separator = '•'}) => `'${separator}'`};
    margin-left: ${({spacing = '5px'}) => spacing};
  }
`;

HorizontalSep.propTypes = {
  separator: PropTypes.string,
  spacing: PropTypes.string,
  wrap: PropTypes.oneOf([true, 'wrap', 'nowrap']),
};

export default HorizontalSep;
