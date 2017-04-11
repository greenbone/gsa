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

import {classes} from '../utils.js';

import PropTypes from './proptypes.js';

import './css/sortby.css';

export class SortBy extends React.Component {

  constructor(...args) {
    super(...args);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    let {by, onClick} = this.props;

    if (onClick) {
      onClick(by);
    }
  }

  render() {
    let {children, className} = this.props;

    className = classes(className, 'sort-by');
    return (
      <a onClick={this.handleClick} className={className}>{children}</a>
    );
  }
};

SortBy.propTypes = {
  by: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default SortBy;

// vim: set ts=2 sw=2 tw=80:
