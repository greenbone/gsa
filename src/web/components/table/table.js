/* Copyright (C) 2016-2022 Greenbone AG
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

import PropTypes from 'web/utils/proptypes';
import {styledExcludeProps} from 'web/utils/styledConfig';

const Table = ({children, className, footer, header}) => {
  return (
    <table className={className}>
      {header}
      {children}
      {footer}
    </table>
  );
};

Table.propTypes = {
  className: PropTypes.string,
  fixed: PropTypes.bool,
  footer: PropTypes.element,
  header: PropTypes.element,
};

export default styledExcludeProps(styled(Table), ['fixed', 'size'])`
  border: 0;
  border-spacing: 0px;
  font-size: 12px;
  text-align: left;
  table-layout: ${props => (props.fixed ? 'fixed' : 'auto')};
  ${props => {
    const {size = 'full'} = props;
    if (size === 'auto') {
      return {};
    }
    if (size === 'full') {
      return {
        width: '100%',
      };
    }
    return {
      width: size,
    };
  }};
  @media print {
    border-collapse: collapse;
  }
`;

// vim: set ts=2 sw=2 tw=80:
