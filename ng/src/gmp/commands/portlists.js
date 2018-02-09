/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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

import logger from '../log.js';

import {EntityCommand, EntitiesCommand, register_command} from '../command.js';

import PortList from '../models/portlist.js';

const log = logger.getLogger('gmp.commands.portlists');

class PortListCommand extends EntityCommand {

  constructor(http) {
    super(http, 'port_list', PortList);
  }

  create(args) {
    const {name, comment = '', from_file, port_range, file} = args;
    log.debug('Creating new port list', args);
    return this.action({
      cmd: 'create_port_list',
      next: 'get_port_list',
      name,
      comment,
      from_file,
      port_range,
      file,
    });
  }

  save(args) {
    const {id, name, comment = ''} = args;

    log.debug('Saving port list', args);
    return this.action({
      cmd: 'save_port_list',
      next: 'get_port_list',
      comment,
      id,
      name,
    });
  }

  createPortRange(args) {
    const {id, port_range_start, port_range_end, port_type} = args;
    return this.httpPost({
      cmd: 'create_port_range',
      next: 'get_port_list',
      id,
      port_range_start,
      port_range_end,
      port_type,
    });
  }

  deletePortRange({id, port_list_id}) {
    return this.httpPost({
      cmd: 'delete_port_range',
      port_range_id: id,
      no_redirect: 1,
    }).then(() => this.get({id: port_list_id}));
  }

  import(args) {
    const {xml_file} = args;
    log.debug('Importing port list', args);
    return this.httpPost({
      cmd: 'import_port_list',
      next: 'get_port_list',
      xml_file,
    });
  }

  getElementFromRoot(root) {
    return root.get_port_list.get_port_lists_response.port_list;
  }
}

class PortListsCommand extends EntitiesCommand {

  constructor(http) {
    super(http, 'port_list', PortList);
  }

  getEntitiesResponse(root) {
    return root.get_port_lists.get_port_lists_response;
  }
}

register_command('portlist', PortListCommand);
register_command('portlists', PortListsCommand);

// vim: set ts=2 sw=2 tw=80:
