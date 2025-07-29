/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQuery} from '@tanstack/react-query';
import {XMLParser} from 'fast-xml-parser';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import {parseCounts, parseFilter} from 'gmp/collection/parser';
import EntitiesCommand from 'gmp/commands/entities';
import EntityCommand from 'gmp/commands/entity';
import GmpHttp from 'gmp/http/gmp';
import logger from 'gmp/log';
import Filter from 'gmp/models/filter';
import {Element} from 'gmp/models/model';
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

const PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  ignoreAttributes: false,
  removeNSPrefix: true,
  textNodeName: '__text',
};

export const usePortLists = ({
  token,
  filter = undefined,
}: {
  token: string;
  filter?: Filter;
}) => {
  return useQuery({
    queryKey: ['portLists', token, filter],
    queryFn: async () => {
      const params = new URLSearchParams({
        token,
        cmd: 'get_port_lists',
        filter: filter ? filter.toFilterString() : '',
      });
      const response = await fetch(
        `http://127.0.0.1:9392/gmp?${params.toString()}`,
        {
          credentials: 'include',
        },
      );
      const text = await response.text();
      const parser = new XMLParser(PARSER_OPTIONS);
      const {envelope} = parser.parse(text);
      const responseData = envelope?.get_port_lists?.get_port_lists_response;
      const portLists = responseData?.port_list;

      // Use parseCounts to extract counts data
      const name = 'port_list';
      const countsData = parseCounts(responseData, name);

      // Create CollectionCounts instance
      const entitiesCounts = new CollectionCounts(countsData);

      // Use parseFilter to extract filter data
      const responseFilter = filter || parseFilter(responseData);

      // Handle both array and single object for portLists in a lint-friendly way
      let parsedPortLists: Element[] = [];
      if (portLists) {
        parsedPortLists = Array.isArray(portLists) ? portLists : [portLists];
      }

      // Returning structure that matches CollectionList from parseCollectionList
      return {
        portLists: parsedPortLists,
        entitiesCounts,
        filter: responseFilter,
      };
    },
    select: data => {
      // Transform to match the EntitiesCommand.get() return structure
      return {
        entities: data.portLists.map(el => PortList.fromElement(el)),
        entitiesCounts: data.entitiesCounts,
        filter: data.filter,
      };
    },
    refetchInterval: 3000, // fetch every 3s
  });
};
