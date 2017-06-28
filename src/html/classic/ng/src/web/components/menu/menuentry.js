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

import {is_defined, is_array} from '../../../utils.js';

import PropTypes from '../../proptypes.js';

import Link from '../link/link.js';
import LegacyLink from '../link/legacylink.js';

import './css/menuentry.css';

// don't pass event to handler
const handler_wrapper = handler => {
  if (handler) {
    return () => {
      handler();
    };
  }
  return undefined;
};

const MenuEntry = ({
    caps,
    legacy,
    section,
    title,
    to,
    onClick,
    ...other,
  }, {capabilities}) => {
  let entry;
  let css = section ? "menu-entry menu-section" : "menu-entry";

  if (is_defined(caps) && is_defined(capabilities)) {

    if (!is_array(caps)) {
      caps = [caps];
    }

    let may_op = caps.reduce((a, b) => {
      return capabilities.mayOp(b) && a;
    }, true);

    if (!may_op) {
      return null;
    }
  }

  if (is_defined(to)) {
    entry = <Link to={to}>{title}</Link>;
  }
  else if (legacy) {
    entry = <LegacyLink {...other}>{title}</LegacyLink>;
  }
  else {
    entry = title;
  }
  return (
    <li className={css} onClick={handler_wrapper(onClick)}>{entry}</li>
  );
};

MenuEntry.propTypes = {
  caps: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  section: PropTypes.bool,
  legacy: PropTypes.bool,
  to: PropTypes.string,
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
};

MenuEntry.contextTypes = {
  capabilities: PropTypes.capabilities,
};

export default MenuEntry;

// vim: set ts=2 sw=2 tw=80:
