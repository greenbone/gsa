/* Copyright (C) 2017-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import 'core-js/features/set';

import registerCommand from '../command';

import logger from '../log';

import {isArray} from '../utils/identity';

import Role from '../models/role';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.roles');

class RoleCommand extends EntityCommand {
  constructor(http) {
    super(http, 'role', Role);
  }

  create({name, comment = '', users = []}) {
    const data = {
      cmd: 'create_role',
      name,
      comment,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Creating new role', data);
    return this.action(data);
  }

  save({id, name, comment = '', users = []}) {
    const data = {
      cmd: 'save_role',
      id,
      name,
      comment,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Saving role', data);
    return this.action(data);
  }

  getElementFromRoot(root) {
    return root.get_role.get_roles_response.role;
  }
}

class RolesCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'role', Role);
  }

  getEntitiesResponse(root) {
    return root.get_roles.get_roles_response;
  }
}

registerCommand('role', RoleCommand);
registerCommand('roles', RolesCommand);

// vim: set ts=2 sw=2 tw=80:
