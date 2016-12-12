/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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

import {log} from '../../utils.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import PortList from '../models/portlist.js';

export class PortListCommand extends EntityCommand {

  constructor(http) {
    super(http, 'get_port_list', 'port_list_id', PortList);
  }

  create(args) {
    let {name, comment = '', from_file, port_range, file} = args;
    log.debug('Creating new port list', args);
    return this.httpPost({
      cmd: 'create_port_list',
      next: 'get_port_list',
      name,
      comment,
      from_file,
      port_range,
      file,
    }).then(xhr => this.getModelFromResponse(xhr));
  }

  getElementFromResponse(xhr) {
    return xhr.get_port_list.get_port_lists_response.port_list;
  }
}

export class PortListsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'get_port_lists', PortList);
  }

  getElementsFromResponse(response) {
    return response.port_list;
  }

  getCountsFromResponse(response) {
    let es = response.port_lists;
    let ec = response.port_list_count;
    return {
      first: es._start,
      rows: es._max,
      length: ec.page,
      all: ec.__text,
      filtered: ec.filtered,
    };
  }

  getEntitiesResponse(root) {
    return root.get_port_lists.get_port_lists_response;
  }
}

register_command('portlist', PortListCommand);
register_command('portlists', PortListsCommand);

// vim: set ts=2 sw=2 tw=80:
