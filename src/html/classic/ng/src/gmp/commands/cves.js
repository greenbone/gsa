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

import {is_defined} from '../utils.js';

import {InfoEntitiesCommand, EntityCommand,
  register_command} from '../command.js';

import Cve from '../models/cve.js';

const info_filter = info => is_defined(info.cve);

export class CveCommand extends EntityCommand {

  constructor(http) {
    super(http, 'info', Cve);
    this.setParam('info_type', 'cve');
  }
}

export class CvesCommand extends InfoEntitiesCommand {

  constructor(http) {
    super(http, 'cve', Cve, info_filter);
  }
}

register_command('cve', CveCommand);
register_command('cves', CvesCommand);

// vim: set ts=2 sw=2 tw=80:
