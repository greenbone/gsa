/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import logger from 'gmp/log';
import Role from 'gmp/models/role';
import {isArray} from 'gmp/utils/identity';

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
