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

import glamorous from 'glamorous';

import PropTypes from '../../utils/proptypes.js';

import Layout from '../layout/layout.js';

import Sort from '../sortby/sortby.js';

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

export default glamorous(TableHead)({
  backgroundColor: '#3A3A3A',
  color: '#FFFFFF',
  fontWeight: 'bold',

  '@media print': {
    color: 'black',
    fontSize: '1.2em',
    backgroundColor: 'none',
    fontWeight: 'bold',
  },
},
  props => ({
    width: props.width,
  }),
);

// vim: set ts=2 sw=2 tw=80:
