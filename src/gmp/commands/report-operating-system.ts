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
import ReportOperatingSystem from 'gmp/models/report/os';
import {map} from 'gmp/utils/array';

interface OperatingSystemElement {
  best_os_cpe?: string;
  best_os_txt?: string;
  hosts_count?: string | number;
}

interface ReportOperatingSystemsResponseData extends XmlResponseData {
  get_report_operating_systems?: {
    get_report_operating_systems_response?: {
      filters?: FilterModelElement;
      operating_systems?: {
        operating_system?: OperatingSystemElement | OperatingSystemElement[];
      };
    };
  };
}

class ReportOperatingSystemsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_operating_systems'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportOperatingSystem[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportOperatingSystemsResponseData;

    if (!root.get_report_operating_systems) {
      throw new Error(
        'Invalid response: get_report_operating_systems not found in response',
      );
    }

    const data =
      root.get_report_operating_systems.get_report_operating_systems_response;

    const filter = parseFilter(data ?? {});

    const entities = map(
      data?.operating_systems?.operating_system,
      (item: OperatingSystemElement) => {
        return ReportOperatingSystem.fromElement(item);
      },
    );

    const filteredCount = entities.length;
    const counts = new CollectionCounts({
      all: filteredCount,
      filtered: filteredCount,
      first: 1,
      length: filteredCount,
      rows: filteredCount,
    });

    return response.set<ReportOperatingSystem[], EntitiesMeta>(entities, {
      filter,
      counts,
    });
  }
}

export default ReportOperatingSystemsCommand;
