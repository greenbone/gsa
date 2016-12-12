/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {classes, is_defined} from '../utils.js';

import './css/table.css';

export const TableRow = props => {
  let {items = [], ...other} = props;
  let data = items.map((item, i) => {
    return <th key={i}>{item}</th>;
  });
  return (
    <tr {...other}>
      {data}
      {props.children}
    </tr>
  );
};

export const TableHead = props => {
  let {width, ...other} = props;
  let style = {};

  if (is_defined(width)) {
    style.width = width;
  }
  return (
    <th style={style} {...other}></th>
  );
};

TableHead.propTypes = {
  width: React.PropTypes.string,
};


TableRow.propTypes = {
  items: React.PropTypes.array,
};

export const Table = props => {
  let {header, footer, children, className} = props;

  className = classes(className, 'table');

  return (
    <table className={className}>
      <thead>
        {header}
      </thead>
      <tbody>
        {children}
      </tbody>
      <tfoot>
        {footer}
      </tfoot>
    </table>
  );
};

Table.propTypes = {
  header: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
  ]),
  footer: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
  ]),
  className: React.PropTypes.string,
};

export const StrippedTable = props => {
  let {className, ...other} = props;

  className = classes(className, 'table-stripped');
  return (
    <Table className={className} {...other}/>
  );
};

StrippedTable.propTypes = {
  className: React.PropTypes.string,
};

export default Table;

// vim: set ts=2 sw=2 tw=80:
