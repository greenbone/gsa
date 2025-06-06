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
import {NO_VALUE, YES_VALUE} from 'gmp/parser';

const log = logger.getLogger('gmp.commands.portlists');

export const FROM_FILE = YES_VALUE;
export const NOT_FROM_FILE = NO_VALUE;

export type FromFile = typeof FROM_FILE | typeof NOT_FROM_FILE;

interface PortListCommandCreateParams {
  name: string;
  comment?: string;
  fromFile?: FromFile;
  portRange?: string;
  file?: string;
}

interface PortListCommandSaveParams {
  id: string;
  name: string;
  comment?: string;
}

interface PortListCommandCreatePortRangeParams {
  portListId: string;
  portRangeStart: number;
  portRangeEnd: number;
  portType: string;
}

interface PortListCommandDeletePortRangeParams {
  id: string;
  portListId: string;
}

interface PortListCommandImportParams {
  xmlFile: File;
}

export class PortListCommand extends EntityCommand<PortList, PortListElement> {
  constructor(http: GmpHttp) {
    super(http, 'port_list', PortList);
  }

  create({
    name,
    comment = '',
    fromFile,
    portRange,
    file,
  }: PortListCommandCreateParams) {
    log.debug('Creating new port list', {
      name,
      comment,
      from_file: fromFile,
      port_range: portRange,
      file,
    });
    return this.action({
      cmd: 'create_port_list',
      name,
      comment,
      from_file: fromFile,
      port_range: portRange,
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
    portListId,
    portRangeStart,
    portRangeEnd,
    portType,
  }: PortListCommandCreatePortRangeParams) {
    return this.action({
      cmd: 'create_port_range',
      id: portListId,
      port_range_start: portRangeStart,
      port_range_end: portRangeEnd,
      port_type: portType,
    });
  }

  async deletePortRange({
    id,
    portListId,
  }: PortListCommandDeletePortRangeParams) {
    await this.httpPost({
      cmd: 'delete_port_range',
      port_range_id: id,
      no_redirect: 1,
    });
    return await this.get({id: portListId});
  }

  import({xmlFile}: PortListCommandImportParams) {
    log.debug('Importing port list', {xml_file: xmlFile});
    return this.httpPost({
      cmd: 'import_port_list',
      xml_file: xmlFile,
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
