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

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import Link from '../link/link.js';
import LegacyLink from '../link/legacylink.js';

import './css/menu.css';

function create_link(title, options = {}) {
  const {to, legacy, children, caps, ...other} = options; // eslint-disable-line no-unused-vars
  if (legacy) {
    return <LegacyLink {...other}>{title}</LegacyLink>;
  }
  else if (to) {
    return <Link to={to}>{title}</Link>;
  }
  return undefined;
}

const Menu = ({children, title, ...props}) => {
  let link = create_link(title, props);

  if (!is_defined(link) && is_defined(children) && children.length > 0) {
    // create link from first menu entry
    // this allows to have different links depending on the capabilities of a
    // user
    const [child] = children;
    link = create_link(title, child.props);
  }
  return (
    <li className="menu">
      {link}
      {is_defined(children) && children.length > 0 &&
        <ul>
          <li className="menu-point"></li>
          {children}
        </ul>
      }
    </li>
  );
};

Menu.propTypes = {
  legacy: PropTypes.bool,
  title: PropTypes.string.isRequired,
  to: PropTypes.string,
};

export default Menu;

// vim: set ts=2 sw=2 tw=80:
