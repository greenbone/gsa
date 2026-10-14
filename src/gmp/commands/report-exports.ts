/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import CollectionCounts from 'gmp/collection/collection-counts';
import {parseCounts, parseFilter} from 'gmp/collection/parser';
import HttpCommand from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import {type XmlResponseData} from 'gmp/http/transform/fast-xml';
import type FilterType from 'gmp/models/filter/filter-type';
import {type FilterResponseElement} from 'gmp/models/filter/query-filter';
import ReportExport, {type ReportExportElement} from 'gmp/models/report-export';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';

interface ReportExportsResponseElement {
  filters: FilterResponseElement;
  report_export?: ReportExportElement | ReportExportElement[];
}

interface GetReportExportsResponseData extends XmlResponseData {
  get_report_exports?: {
    get_report_exports_response?: ReportExportsResponseElement;
  };
}

interface GetReportExportsParams {
  filter: FilterType;
}

const parseReportExports = (element?: ReportExportsResponseElement) =>
  map(element?.report_export, element =>
    ReportExport.fromElement(element),
  ).filter(
    (item): item is ReportExport => isDefined(item) && isDefined(item.id),
  );

class ReportExportsCommand extends HttpCommand {
  constructor(http: Http) {
    super(http);
  }

  async get({filter}: GetReportExportsParams) {
    const response = await this.httpGetWithTransform({
      cmd: 'get_report_exports',
      filter,
    });
    const data = response.data as GetReportExportsResponseData;
    const collection = data.get_report_exports?.get_report_exports_response;
    if (!collection) {
      throw new Error('Invalid report export collection response');
    }
    return response.set(parseReportExports(collection), {
      counts: new CollectionCounts(parseCounts(collection, 'report_export')),
      filter: parseFilter(collection),
    });
  }
}

export default ReportExportsCommand;
