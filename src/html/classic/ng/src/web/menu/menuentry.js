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

import Link from '../link.js';
import LegacyLink from '../legacylink.js';

import {is_defined, is_array} from '../../utils.js';

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

export const MenuEntry = (props, context) => {
  let {to, title, legacy, section, onClick, caps, ...other} = props;
  let entry;
  let css = section ? "menu-entry menu-section" : "menu-entry";

  if (is_defined(caps) && is_defined(context) &&
    is_defined(context.capabilities)) {

    if (!is_array(caps)) {
      caps = [caps];
    }

    let may_op = caps.reduce((a, b) => {
      return context.capabilities.mayOp(b) && a;
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
  caps: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.array,
  ]),
  section: React.PropTypes.bool,
  legacy: React.PropTypes.bool,
  to: React.PropTypes.string,
  title: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func,
};

MenuEntry.contextTypes = {
  capabilities: React.PropTypes.object,
};

export default MenuEntry;

// vim: set ts=2 sw=2 tw=80:
