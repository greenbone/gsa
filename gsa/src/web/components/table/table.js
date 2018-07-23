/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

const Table = ({
    children,
    className,
    footer,
    header,
  }) => {
  return (
    <table
      className={className}
    >
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

export default glamorous(Table, {
  displayName: 'Table',
})(
  'table',
  {
    border: 0,
    borderSpacing: '2px',
    fontSize: '12px',
    textAlign: 'left',

    '@media print': {
      borderCollapse: 'collapse',
    },
  },
  ({fixed}) => ({tableLayout: fixed ? 'fixed' : 'auto'}),
  ({size = 'full'}) => {
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
  },
);

// vim: set ts=2 sw=2 tw=80:
