/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntityCommand from 'gmp/commands/entity';
import type GmpHttp from 'gmp/http/gmp';
import {type XmlResponseData} from 'gmp/http/transform/fastxml';
import logger from 'gmp/log';
import Role, {type RoleElement} from 'gmp/models/role';
import {isArray} from 'gmp/utils/identity';

interface RoleCommandCreateParams {
  name: string;
  comment?: string;
  users?: string[] | string;
}

interface RoleCommandSaveParams {
  id: string;
  name: string;
  comment?: string;
  users?: string[] | string;
}

const log = logger.getLogger('gmp.commands.role');

class RoleCommand extends EntityCommand<Role, RoleElement> {
  constructor(http: GmpHttp) {
    super(http, 'role', Role);
  }

  async create({name, comment = '', users = []}: RoleCommandCreateParams) {
    const data = {
      cmd: 'create_role',
      name,
      comment,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Creating new role', data);
    return await this.entityAction(data);
  }

  async save({id, name, comment = '', users = []}: RoleCommandSaveParams) {
    const data = {
      cmd: 'save_role',
      id,
      name,
      comment,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Saving role', data);
    await this.httpPost(data);
  }

  getElementFromRoot(root: XmlResponseData): RoleElement {
    // @ts-expect-error
    return root.get_role.get_roles_response.role;
  }
}

export default RoleCommand;
