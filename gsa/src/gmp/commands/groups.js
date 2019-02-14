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
import registerCommand from '../command';

import logger from '../log';

import {isArray} from '../utils/identity';

import Group from '../models/group';

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
