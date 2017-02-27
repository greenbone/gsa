/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import {is_defined} from '../../utils.js';

import {InfoEntitiesCommand, EntityCommand,
  register_command} from '../command.js';

import Nvt from '../models/nvt.js';

const info_filter = info => is_defined(info.nvt);

export class NvtCommand extends EntityCommand {

  constructor(http) {
    super(http, 'info', Nvt);
    this.setParam('info_type', 'nvt');
  }
}

export class NvtsCommand extends InfoEntitiesCommand {

  constructor(http) {
    super(http, 'nvt', Nvt, info_filter);
  }
}

register_command('nvt', NvtCommand);
register_command('nvts', NvtsCommand);

// vim: set ts=2 sw=2 tw=80:
