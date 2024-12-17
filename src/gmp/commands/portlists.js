/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import registerCommand from 'gmp/command';
import logger from 'gmp/log';
import PortList from 'gmp/models/portlist';

import EntitiesCommand from './entities';
import EntityCommand from './entity';

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
      comment,
      id,
      name,
    });
  }

  createPortRange(args) {
    const {id, port_range_start, port_range_end, port_type} = args;
    return this.action({
      cmd: 'create_port_range',
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

registerCommand('portlist', PortListCommand);
registerCommand('portlists', PortListsCommand);
