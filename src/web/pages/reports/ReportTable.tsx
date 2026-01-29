/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import type Report from 'gmp/models/report';
import {isDefined} from 'gmp/utils/identity';
import SeverityClassLabel from 'web/components/label/SeverityClass';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {
  type FooterComponentProps,
  type HeaderComponentProps,
} from 'web/entities/EntitiesTable';
import useGmp from 'web/hooks/useGmp';
import {AgentIdTableHead} from 'web/pages/agents/components/AgentIdColumn';
import ReportTableRow, {
  type ReportTableRowProps,
} from 'web/pages/reports/ReportTableRow';

interface ReportTableHeaderProps extends HeaderComponentProps {
  actionsColumn?: React.ReactNode;
  sort?: boolean;
}

const ReportTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: ReportTableHeaderProps) => {
  const gmp = useGmp();
  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="date"
          title={_('Date')}
          width="25%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="status"
          title={_('Status')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="task"
          title={_('Task')}
          width="39%"
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
          sort={sort}
          sortBy="severity"
          title={_('Severity')}
          width="8%"
          onSortChange={onSortChange}
        />
        {useCVSSv3 && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sort={sort}
            sortBy="critical"
            title={_('Critical')}
            width="3%"
            onSortChange={onSortChange}
          >
            <SeverityClassLabel.Critical />
          </TableHead>
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="high"
          title={_('High')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.High />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="medium"
          title={_('Medium')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.Medium />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="low"
          title={_('Low')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.Low />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="log"
          title={_('Log')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.Log />
        </TableHead>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="false_positive"
          title={_('False Positive')}
          width="3%"
          onSortChange={onSortChange}
        >
          <SeverityClassLabel.FalsePositive />
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

const Footer = createEntitiesFooter<Report>({
  span: 10,
  delete: true,
});

export default createEntitiesTable<
  Report,
  FooterComponentProps<Report>,
  ReportTableHeaderProps,
  ReportTableRowProps
>({
  emptyTitle: _l('No reports available'),
  header: ReportTableHeader,
  footer: Footer,
  row: ReportTableRow,
});
