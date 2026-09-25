/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {
  type ComplianceType,
  getTranslatableReportCompliance,
} from 'gmp/models/compliance';
import {AUDIT_REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTableDisplay from 'web/components/dashboard/display/DataTableDisplay';
import StatusDisplay from 'web/components/dashboard/display/status/StatusDisplay';
import {
  complianceColorScale,
  totalCount,
  percent,
} from 'web/components/dashboard/display/utils';
import {registerDisplay} from 'web/components/dashboard/registry';
import {
  type AuditReportStatusData,
  ReportComplianceLoader,
} from 'web/pages/reports/auditdashboard/AuditReportLoaders';

interface TransformedAuditReportStatusDataItem {
  value: number;
  label: string;
  toolTip: string;
  color: string;
  filterValue: string;
}

interface TransformedAuditReportStatusData extends Array<TransformedAuditReportStatusDataItem> {
  total: number;
}

const transformStatusData = (
  data: AuditReportStatusData = {},
): TransformedAuditReportStatusData => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const transformedData = groups.map(group => {
    const {count, value} = group;
    const translatableValue = getTranslatableReportCompliance(
      value as ComplianceType,
    );
    const perc = percent(count, sum);
    return {
      value: count,
      label: translatableValue,
      toolTip: `${translatableValue}: ${perc}% (${count})`,
      color: complianceColorScale(value),
      filterValue: value,
    };
  });

  const result = transformedData as TransformedAuditReportStatusData;
  result.total = sum;
  return result;
};

export const ReportComplianceDisplay = createDisplay({
  displayComponent: props => (
    <StatusDisplay
      {...props}
      dataTransform={transformStatusData}
      filterTerm="compliant"
      title={({data}) =>
        _('Audit Reports by Compliance (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
  displayId: 'report-by-compliance',
  filtersFilter: AUDIT_REPORTS_FILTER_FILTER,
  loaderComponent: ReportComplianceLoader,
});

export const ReportComplianceTableDisplay = createDisplay({
  loaderComponent: ReportComplianceLoader,
  displayComponent: props => (
    <DataTableDisplay
      {...props}
      dataRow={transformedData =>
        transformedData?.map(row => [row.label, row.value]) ?? []
      }
      dataTitles={[_l('Status'), _l('# of Reports')]}
      dataTransform={transformStatusData}
      title={({data}) =>
        _('Audit Reports by Compliance (Total: {{count}})', {
          count: data?.total ?? 0,
        })
      }
    />
  ),
  displayId: 'report-by-compliance-table',
  displayName: 'ReportComplianceTableDisplay',
  filtersFilter: AUDIT_REPORTS_FILTER_FILTER,
});

registerDisplay(
  ReportComplianceDisplay,
  _l('Chart: Audit Reports by Compliance'),
);

registerDisplay(
  ReportComplianceTableDisplay,
  _l('Table: Audit Reports by Compliance'),
);
