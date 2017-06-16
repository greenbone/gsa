/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import styled from 'styled-components';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import Sort from '../sortby.js';

const TableHead = ({
    children,
    className,
    colSpan,
    rowSpan,
    sortby,
    width,
    onSortChange,
    ...other
  }) => {
  return (
    <th
      className={className}
      rowSpan={rowSpan}
      colSpan={colSpan}>
      {sortby ?
        <Sort by={sortby} onClick={onSortChange}>
          <Layout {...other}>
            {children}
          </Layout>
        </Sort> :
        <Layout {...other}>
          {children}
        </Layout>
      }
    </th>
  );
};

TableHead.propTypes = {
  colSpan: PropTypes.numberString,
  className: PropTypes.string,
  rowSpan: PropTypes.numberString,
  sortby: PropTypes.stringOrFalse,
  width: PropTypes.string,
  onSortChange: PropTypes.func,
};

export default styled(TableHead)`
  background-color: #3A3A3A;
  color: #FFFFFF;
  font-weight: bold;
  width: ${props => props.width};

  @media print {
    color: black;
    font-size: 1.2em;
    background-color: none;
    font-weight: bold;
  }
`;

// vim: set ts=2 sw=2 tw=80:
