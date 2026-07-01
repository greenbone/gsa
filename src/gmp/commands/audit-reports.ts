/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import EntitiesCommand from 'gmp/commands/entities';
import {
  type HttpCommandInputParams,
  type HttpCommandOptions,
} from 'gmp/commands/http';
import type Http from 'gmp/http/http';
import AuditReport from 'gmp/models/audit-report';
import type Filter from 'gmp/models/filter';
import {type Element} from 'gmp/models/model';

interface AuditReportAggregatesParams {
  filter?: Filter | string;
}

class AuditReportsCommand extends EntitiesCommand<AuditReport> {
  constructor(http: Http) {
    super(http, 'report', AuditReport);
  }

  getEntitiesResponse(root: Element): Element {
    // @ts-expect-error
    return root.get_reports.get_reports_response;
  }

  getComplianceAggregates({filter}: AuditReportAggregatesParams = {}) {
    return this.getAggregates({
      aggregate_type: 'report',
      group_column: 'compliant',
      usage_type: 'audit',
      filter,
    });
  }

  get(params: HttpCommandInputParams = {}, options?: HttpCommandOptions) {
    return super.get(
      {
        details: 0,
        ...params,
        usage_type: 'audit',
      },
      options,
    );
  }
}

export default AuditReportsCommand;
