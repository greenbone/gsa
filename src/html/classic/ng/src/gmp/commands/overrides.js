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

import logger from '../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import Override from '../models/override.js';

const log = logger.getLogger('gmp.commands.overrides');

export const MANUAL = '1';
export const ANY = '0';

export class OverrideCommand extends EntityCommand {

  constructor(http) {
    super(http, 'override', Override);
  }

  getElementFromRoot(root) {
    return root.get_override.get_overrides_response.override;
  }

  create(args) {
    return this._save({cmd: 'create_override', ...args});
  }

  save(args) {
    return this._save({cmd: 'save_override', ...args});
  }

  _save(args) {
    let {cmd, oid, override_id, active = '-1', days = 30, hosts = '',
      hosts_manual = '', result_id = '', result_uuid = '', port = '',
      port_manual = '', severity = '', task_id = '', task_uuid = '', text,
      custom_severity = '0', new_severity = '',
      new_severity_from_list = '-1.0'} = args;

    log.debug('Saving override', args);
    return this.httpPost({
      cmd,
      next: 'get_override',
      oid,
      override_id,
      active,
      custom_severity,
      new_severity,
      new_severity_from_list,
      days,
      hosts: hosts === MANUAL ? '--' : '',
      hosts_manual,
      result_id,
      result_uuid,
      task_id,
      task_uuid,
      port: port === MANUAL ? '--' : '',
      port_manual,
      severity,
      text,
    }).then(this.transformResponse);
  }
}

export class OverridesCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'override', Override);
  }

  getEntitiesResponse(root) {
    return root.get_overrides.get_overrides_response;
  }
};

register_command('override', OverrideCommand);
register_command('overrides', OverridesCommand);

// vim: set ts=2 sw=2 tw=80:
