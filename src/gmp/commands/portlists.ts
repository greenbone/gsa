/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import GmpHttp from 'gmp/http/gmp';
import logger from 'gmp/log';
import {Element} from 'gmp/model';
import PortList, {PortListElement} from 'gmp/models/portlist';

const log = logger.getLogger('gmp.commands.portlists');

interface PortListCommandCreateParams {
  name: string;
  comment?: string;
  from_file?: string;
  port_range?: string;
  file?: string;
}

interface PortListCommandSaveParams {
  id: string;
  name: string;
  comment?: string;
}

interface PortListCommandCreatePortRangeParams {
  id: string;
  port_range_start: number;
  port_range_end: number;
  port_type: string;
}

interface PortListCommandDeletePortRangeParams {
  id: string;
  port_list_id: string;
}

interface PortListCommandImportParams {
  xml_file: string;
}

export class PortListCommand extends EntityCommand<PortList, PortListElement> {
  constructor(http: GmpHttp) {
    super(http, 'port_list', PortList);
  }

  create({
    name,
    comment = '',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    from_file,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    port_range,
    file,
  }: PortListCommandCreateParams) {
    log.debug('Creating new port list', {
      name,
      comment,
      from_file,
      port_range,
      file,
    });
    return this.action({
      cmd: 'create_port_list',
      name,
      comment,
      from_file,
      port_range,
      file,
    });
  }

  save({id, name, comment = ''}: PortListCommandSaveParams) {
    log.debug('Saving port list', {id, name, comment});
    return this.action({
      cmd: 'save_port_list',
      comment,
      id,
      name,
    });
  }

  createPortRange({
    id,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    port_range_start,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    port_range_end,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    port_type,
  }: PortListCommandCreatePortRangeParams) {
    return this.action({
      cmd: 'create_port_range',
      id,
      port_range_start,
      port_range_end,
      port_type,
    });
  }

  async deletePortRange({
    id,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    port_list_id,
  }: PortListCommandDeletePortRangeParams) {
    await this.httpPost({
      cmd: 'delete_port_range',
      port_range_id: id,
      no_redirect: 1,
    });
    return await this.get({id: port_list_id});
  }

  // eslint-disable-next-line @typescript-eslint/naming-convention
  import({xml_file}: PortListCommandImportParams) {
    log.debug('Importing port list', {xml_file});
    return this.httpPost({
      cmd: 'import_port_list',
      xml_file,
    });
  }

  getElementFromRoot(root: Element): PortListElement {
    // @ts-expect-error
    return root.get_port_list.get_port_lists_response.port_list;
  }
}

export class PortListsCommand extends EntitiesCommand<PortList> {
  constructor(http: GmpHttp) {
    super(http, 'port_list', PortList);
  }

  getEntitiesResponse(root: Element) {
    // @ts-expect-error
    return root.get_port_lists.get_port_lists_response;
  }
}
