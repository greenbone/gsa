/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import logger from 'gmp/log';
import Group from 'gmp/models/group';
import {isArray} from 'gmp/utils/identity';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

const log = logger.getLogger('gmp.commands.groups');

class GroupCommand extends EntityCommand {
  constructor(http) {
    super(http, 'group', Group);
  }

  create({name, comment = '', grant_full, users = []}) {
    const data = {
      cmd: 'create_group',
      name,
      comment,
      grant_full,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Creating new group', data);
    return this.action(data);
  }

  save({id, name, comment = '', grant_full, users = []}) {
    const data = {
      cmd: 'save_group',
      id,
      name,
      comment,
      grant_full,
      users: isArray(users) ? users.join(',') : '',
    };
    log.debug('Saving group', data);
    return this.action(data);
  }

  getElementFromRoot(root) {
    return root.get_group.get_groups_response.group;
  }
}

class GroupsCommand extends EntitiesCommand {
  constructor(http) {
    super(http, 'group', Group);
  }

  getEntitiesResponse(root) {
    return root.get_groups.get_groups_response;
  }
}

registerCommand('group', GroupCommand);
registerCommand('groups', GroupsCommand);

// vim: set ts=2 sw=2 tw=80:
