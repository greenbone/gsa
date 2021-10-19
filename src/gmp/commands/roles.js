/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import registerCommand from 'gmp/command';

import logger from 'gmp/log';

import {isArray} from 'gmp/utils/identity';

import Role from 'gmp/models/role';

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
