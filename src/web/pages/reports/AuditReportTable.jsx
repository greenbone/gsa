/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_l} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import ComplianceState from 'web/components/label/ComplianceState';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import useTranslation from 'web/hooks/useTranslation';
import {AgentIdTableHead} from 'web/pages/agents/components/AgentIdColumn';
import AuditReportRow from 'web/pages/reports/AuditReportRow';
import PropTypes from 'web/utils/PropTypes';

const AuditReportTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'date' : false}
          title={_('Date')}
          width="25%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'status' : false}
          title={_('Status')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'task' : false}
          title={_('Task')}
          width="33%"
          onSortChange={onSortChange}
        />
        <AgentIdTableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'compliant' : false}
          title={_('Compliant')}
          width="11%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'compliance_yes' : false}
          title={_('Compliant')}
          width="5%"
          onSortChange={onSortChange}
        >
          <ComplianceState.Yes />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'compliance_no' : false}
          title={_('Not Compliant')}
          width="5%"
          onSortChange={onSortChange}
        >
          <ComplianceState.No />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'compliance_incomplete' : false}
          title={_('Incomplete')}
          width="5%"
          onSortChange={onSortChange}
        >
          <ComplianceState.Incomplete />
        </TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" width="8%">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};

AuditReportTableHeader.propTypes = {
  actionsColumn: PropTypes.element,
  currentSortBy: PropTypes.string,
  currentSortDir: PropTypes.string,
  sort: PropTypes.bool,
  onSortChange: PropTypes.func,
};

const AuditReportTableFooter = createEntitiesFooter({
  span: 10,
  delete: true,
});

export default createEntitiesTable({
  emptyTitle: _l('No reports available'),
  header: AuditReportTableHeader,
  footer: AuditReportTableFooter,
  row: AuditReportRow,
  toggleDetailsIcon: false,
});
