/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {parseFilter} from 'gmp/collection/parser';
import type {EntitiesMeta} from 'gmp/commands/entities';
import HttpCommand, {
  type HttpCommandInputParams,
  type HttpCommandOptions,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import type Response from 'gmp/http/response';
import type {XmlResponseData} from 'gmp/http/transform/fast-xml';
import type {FilterModelElement} from 'gmp/models/filter';
import ReportPort from 'gmp/models/report/port';
import {parseSeverity} from 'gmp/parser';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface PortElement {
  __text?: string;
  host?: string;
  severity?: number;
  threat?: string;
}

interface PortsContainer {
  _start?: number;
  _max?: number;
  count?: number;
  port?: PortElement | PortElement[];
}

interface ReportPortsResponseData extends XmlResponseData {
  get_report_ports?: {
    get_report_ports_response: {
      ports?: PortsContainer;
      filters?: FilterModelElement;
      [key: string]: unknown;
    };
  };
}

class ReportPortsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_ports'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportPort[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportPortsResponseData;

    if (!root.get_report_ports) {
      throw new Error(
        'Invalid response: get_report_ports not found in response',
      );
    }

    const data = root.get_report_ports.get_report_ports_response;
    const portsContainer = data.ports;

    // Deduplicate ports by id (same port name can appear multiple times for
    // different hosts). Filter out general/* ports to match old parsePorts behavior.
    const tempPorts: Record<string, ReportPort> = {};

    forEach(portsContainer?.port, (port: PortElement) => {
      const id = port.__text;

      if (!isDefined(id) || id.startsWith('general')) {
        return;
      }

      let tPort = tempPorts[id];
      if (isDefined(tPort)) {
        tPort.setSeverity(parseSeverity(port.severity));
      } else {
        tPort = ReportPort.fromElement(port);
        tempPorts[id] = tPort;
      }

      tPort.addHost({ip: port.host});
    });

    const entities = Object.values(tempPorts).sort((a, b) =>
      Number(a.number > b.number),
    );

    const filteredCount = entities.length;
    const counts = new CollectionCounts({
      all: portsContainer?.count ?? filteredCount,
      filtered: filteredCount,
      first: portsContainer?._start ?? 1,
      length: filteredCount,
      rows: portsContainer?._max ?? filteredCount,
    });

    const filter = parseFilter(data);

    return response.set<ReportPort[], EntitiesMeta>(entities, {
      filter,
      counts,
    });
  }
}

export default ReportPortsCommand;
