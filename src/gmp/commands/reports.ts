/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import GmpHttp from 'gmp/http/gmp';
import {XmlResponseData} from 'gmp/http/transform/fastxml';
import Filter from 'gmp/models/filter';
import Report from 'gmp/models/report';

interface ReportsCommandGetParams {
  details?: number;
  usage_type?: string;
  [key: string]: unknown;
}

interface ReportsCommandGetOptions {
  [key: string]: unknown;
}

class ReportsCommand extends EntitiesCommand<Report> {
  constructor(http: GmpHttp) {
    super(http, 'report', Report);
  }

  getEntitiesResponse(root: XmlResponseData): XmlResponseData {
    // @ts-expect-error
    return root.get_reports.get_reports_response;
  }

  getSeverityAggregates({filter}: {filter: Filter} = {filter: new Filter()}) {
    return this.getAggregates({
      aggregate_type: 'report',
      group_column: 'severity',
      filter,
    });
  }

  getHighResultsAggregates(
    {filter}: {filter: Filter} = {filter: new Filter()},
  ) {
    return this.getAggregates({
      aggregate_type: 'report',
      group_column: 'date',
      dataColumns: ['high', 'high_per_host'],
      filter,
    });
  }

  get(params: ReportsCommandGetParams, options: ReportsCommandGetOptions) {
    return super.get(
      {
        details: 0,
        ...params,
        usage_type: 'scan',
      },
      options,
    );
  }
}

export default ReportsCommand;
