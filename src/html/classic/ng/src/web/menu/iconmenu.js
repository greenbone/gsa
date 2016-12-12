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

import Icon from '../icon.js';

import './css/iconmenu.css';

export const IconMenu = props => {

  let {children, onClick, ...other} = props;
  let css = onClick ? 'icon-menu icon-button' : 'icon-menu';

  return (
    <span className={css}>
      <Icon onClick={onClick} {...other}/>
      <ul>
        {children}
      </ul>
    </span>
  );
};

IconMenu.propTypes = {
  img: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func,
};

export default IconMenu;

// vim: set ts=2 sw=2 tw=80:
