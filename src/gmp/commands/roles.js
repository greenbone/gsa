/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
