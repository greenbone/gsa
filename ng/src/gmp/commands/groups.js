/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {is_array} from '../utils/identity';

import Group from '../models/group.js';

const log = logger.getLogger('gmp.commands.groups');

export class GroupCommand extends EntityCommand {

  constructor(http) {
    super(http, 'group', Group);
  }

  create({
    name,
    comment = '',
    grant_full,
    users = [],
  }) {
    const data = {
      cmd: 'create_group',
      next: 'get_group',
      name,
      comment,
      grant_full,
      users: is_array(users) ? users.join(',') : '',
    };
    log.debug('Creating new group', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  save({
    id,
    name,
    comment = '',
    grant_full,
    users = [],
  }) {
    const data = {
      cmd: 'save_group',
      next: 'get_group',
      id,
      name,
      comment,
      grant_full,
      users: is_array(users) ? users.join(',') : '',
    };
    log.debug('Saving group', data);
    return this.httpPost(data).then(this.transformResponse);
  }

  getElementFromRoot(root) {
    return root.get_group.get_groups_response.group;
  }
}

export class GroupsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'group', Group);
  }

  getEntitiesResponse(root) {
    return root.get_groups.get_groups_response;
  }
}

register_command('group', GroupCommand);
register_command('groups', GroupsCommand);

// vim: set ts=2 sw=2 tw=80:
