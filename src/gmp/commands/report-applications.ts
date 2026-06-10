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
import ReportApp from 'gmp/models/report/app';
import {forEach} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

export interface ApplicationElement {
  name?: string;
  hosts_count?: number | string;
  occurrences?: number | string;
  severity?: number | string;
  threat?: string;
}

interface ApplicationsContainer {
  _start?: number;
  _max?: number;
  count?: number;
  application?: ApplicationElement | ApplicationElement[];
}

interface ReportApplicationsResponseData extends XmlResponseData {
  get_report_applications?: {
    get_report_applications_response: {
      applications?: ApplicationsContainer;
      filters?: FilterModelElement;
      [key: string]: unknown;
    };
  };
}

class ReportApplicationsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http, {cmd: 'get_report_applications'});
  }

  async get(
    params: HttpCommandInputParams = {},
    options?: HttpCommandOptions,
  ): Promise<Response<ReportApp[], EntitiesMeta>> {
    const response = await this.httpGetWithTransform(
      {details: 1, ...params},
      options,
    );

    const root = response.data as ReportApplicationsResponseData;

    if (!root.get_report_applications) {
      throw new Error(
        'Invalid response: get_report_applications not found in response',
      );
    }

    const data = root.get_report_applications.get_report_applications_response;
    const appContainer = data.applications;
    const apps: ReportApp[] = [];

    forEach(appContainer?.application, (app: ApplicationElement) => {
      if (!isDefined(app.name)) {
        return;
      }

      apps.push(ReportApp.fromElement(app));
    });

    const filteredCount = apps.length;
    const counts = new CollectionCounts({
      all: appContainer?.count ?? filteredCount,
      filtered: filteredCount,
      first: appContainer?._start ?? 1,
      length: filteredCount,
      rows: appContainer?._max ?? filteredCount,
    });

    const filter = parseFilter(data);

    return response.set<ReportApp[], EntitiesMeta>(apps, {
      filter,
      counts,
    });
  }
}

export default ReportApplicationsCommand;
