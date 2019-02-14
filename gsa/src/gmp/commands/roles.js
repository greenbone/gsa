/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import 'core-js/fn/set';

import registerCommand from '../command';

import logger from '../log';

import {isArray, isDefined} from '../utils/identity';
import {map} from '../utils/array';

import Model from '../model';

import Permission from '../models/permission';
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

  editRoleSettings({id}) {
    return this.httpGet({
      cmd: 'edit_role',
      id,
    }).then(response => {
      const {capabilities, edit_role} = response.data;

      edit_role.role = new Role(edit_role.get_roles_response.role);

      delete edit_role.get_roles_response;

      const perm_names = new Set();

      edit_role.permissions = map(
        edit_role.get_permissions_response.permission,
        permission => {
          const perm = new Permission(permission);
          if (!isDefined(perm.resource)) {
            perm_names.add(permission.name);
          }
          return perm;
        },
      );

      delete edit_role.get_permissions_response;

      const caps = map(capabilities.help_response.schema.command, cap => {
        cap.name = cap.name.toLowerCase();
        return cap;
      }).filter(cap => {
        return cap.name !== 'get_version' && !perm_names.has(cap.name);
      });

      edit_role.all_permissions = caps;

      edit_role.groups = map(edit_role.get_groups_response.group, group => {
        return new Model(group);
      });

      delete edit_role.get_groups_response;

      return response.setData(edit_role);
    });
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
