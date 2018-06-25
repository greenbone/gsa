/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import Logger from 'gmp/log';

import {is_defined} from 'gmp/utils/identity';

const log = Logger.getLogger('web.components.dashboard.registry');
const registry = {};

export const registerDisplay = (id, component, {title}) => {
  if (!is_defined(id)) {
    log.error('Undefined id passed while registering display');
    return;
  }

  if (!is_defined(component)) {
    log.error('Undefined component passed while registering display', id);
    return;
  }

  if (!is_defined(title)) {
    log.error('Undefined title passed while registering display', id);
    return;
  }

  registry[id] = {
    component,
    title,
    id,
  };

  log.debug('Registered display', id);
};

export const getDisplay = id => registry[id];

// vim: set ts=2 sw=2 tw=80:
