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

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import logger from '../log.js';
import {is_array, is_empty, map} from '../utils.js';

import Model from '../model.js';

import Permission from '../models/permission.js';
import Role from '../models/role.js';

const log = logger.getLogger('gmp.commands.roles');

export class RoleCommand extends EntityCommand {

  constructor(http) {
    super(http, 'role', Role);
  }

  create({
    name,
    comment = '',
    users = [],
  }) {
    const data = {
      cmd: 'create_role',
      next: 'get_role',
      name,
      comment,
      users: is_array(users) ? users.join(',') : '',
    };
    log.debug('Creating new role', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  save({
    id,
    name,
    comment = '',
    users = [],
  }) {
    const data = {
      cmd: 'save_role',
      next: 'get_role',
      id,
      name,
      comment,
      users: is_array(users) ? users.join(',') : '',
    };
    log.debug('Saving role', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  editRoleSettings({id}) {
    return this.httpGet({
      cmd: 'edit_role',
      id,
    }).then(response => {
      let {capabilities, edit_role} = response.data;

      edit_role.role = new Role(
      edit_role.commands_response.get_roles_response.role);

      delete edit_role.commands_response;

      const perm_names = new Set();

      edit_role.permissions = map(
        edit_role.get_permissions_response.permission, permission => {
          let perm = new Permission(permission);
          if (is_empty(perm.resource.id)) {
            perm_names.add(permission.name);
          }
          return perm;
        }
      );

      delete edit_role.get_permissions_response;

      const caps = map(capabilities.help_response.schema.command, cap => {
        cap.name = cap.name.toLowerCase();
        return cap;
      })
        .filter(cap => {
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

export class RolesCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'role', Role);
  }

  getEntitiesResponse(root) {
    return root.get_roles.get_roles_response;
  }
}

register_command('role', RoleCommand);
register_command('roles', RolesCommand);

// vim: set ts=2 sw=2 tw=80:
