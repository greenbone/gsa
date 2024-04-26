/* Copyright (C) 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {_, _l} from 'gmp/locale/lang';

import {AUDIT_REPORTS_FILTER_FILTER} from 'gmp/models/filter';
import {getTranslatableReportCompliance} from 'gmp/models/auditreport';

import {registerDisplay} from 'web/components/dashboard/registry';
import {
  complianceColorScale,
  totalCount,
  percent,
} from 'web/components/dashboard/display/utils';

import createDisplay from 'web/components/dashboard/display/createDisplay';
import DataTable from 'web/components/dashboard/display/datatable';
import DataTableDisplay from 'web/components/dashboard/display/datatabledisplay'; // eslint-disable-line max-len

import StatusDisplay from 'web/components/dashboard/display/status/statusdisplay'; // eslint-disable-line max-len

import {ReportCompianceLoader} from './loaders';

const transformStatusData = (data = {}) => {
  const {groups = []} = data;

  const sum = totalCount(groups);

  const tdata = groups.map(group => {
    const {count, value} = group;
    const translatableValue = getTranslatableReportCompliance(value);
    const perc = percent(count, sum);
    return {
      value: count,
      label: translatableValue,
      toolTip: `${translatableValue}: ${perc}% (${count})`,
      color: complianceColorScale(value),
      filterValue: value,
    };
  });

  tdata.total = sum;

  return tdata;
};

export const ReportComplianceDisplay = createDisplay({
  dataTransform: transformStatusData,
  displayComponent: StatusDisplay,
  filterTerm: 'compliant',
  displayId: 'report-by-compliance',
  title: ({data: tdata}) =>
    _('Audit Reports by Compliance (Total: {{count}})', {
      count: tdata.total,
    }),
  filtersFilter: AUDIT_REPORTS_FILTER_FILTER,
  loaderComponent: ReportCompianceLoader,
});

export const ReportComplianceTableDisplay = createDisplay({
  chartComponent: DataTable,
  displayComponent: DataTableDisplay,
  loaderComponent: ReportCompianceLoader,
  dataTransform: transformStatusData,
  dataTitles: [_l('Status'), _l('# of Reports')],
  dataRow: row => [row.label, row.value],
  title: ({data: tdata}) =>
    _('Audit Reports by Compliance (Total: {{count}})', {
      count: tdata.total,
    }),
  displayId: 'report-by-compliance-table',
  displayName: 'ReportComplianceTableDisplay',
  filtersFilter: AUDIT_REPORTS_FILTER_FILTER,
});

registerDisplay(ReportComplianceDisplay.displayId, ReportComplianceDisplay, {
  title: _l('Chart: Audit Reports by Compliance'),
});

registerDisplay(
  ReportComplianceTableDisplay.displayId,
  ReportComplianceTableDisplay,
  {
    title: _l('Table: Audit Reports by Compliance'),
  },
);

// vim: set ts=2 sw=2 tw=80:
