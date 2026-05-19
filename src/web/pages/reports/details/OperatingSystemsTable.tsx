/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import {COMPLIANCE} from 'gmp/models/compliance';
import type ReportOperatingSystem from 'gmp/models/report/os';
import ComplianceBar from 'web/components/bar/ComplianceBar';
import SeverityBar from 'web/components/bar/SeverityBar';
import OsIcon from 'web/components/icon/OsIcon';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  audit?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

const getColumns = (audit = false) => [
  {
    key: 'name',
    title: _('Operating System'),
    sortBy: 'name',
    render: (entity: ReportOperatingSystem) => (
      <OsIcon osCpe={entity.cpe} osTxt={entity.name} />
    ),
    align: 'center',
  },
  {
    key: 'cpe',
    title: _('CPE'),
    sortBy: 'cpe',
    render: (entity: ReportOperatingSystem) => entity.cpe,
    align: 'center',
  },
  {
    key: 'hosts',
    title: _('Hosts'),
    width: '10%',
    sortBy: 'hosts',
    render: (entity: ReportOperatingSystem) => entity.hosts?.count ?? 0,
    align: 'center',
  },
  ...(audit
    ? [
        {
          key: 'compliance',
          title: _('Compliant'),
          width: '10%',
          sortBy: 'compliance',
          render: (entity: ReportOperatingSystem) => (
            <ComplianceBar compliance={entity.compliance} />
          ),
          align: 'center',
        },
      ]
    : [
        {
          key: 'severity',
          title: _('Severity'),
          width: '10%',
          sortBy: 'severity',
          render: (entity: ReportOperatingSystem) => (
            <SeverityBar severity={entity.severity} />
          ),
          align: 'center',
        },
      ]),
];

const Header = ({
  audit = false,
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}: HeaderProps) => {
  const columns = getColumns(audit);

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => (
          <TableHead
            key={column.key}
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? column.sortBy : undefined}
            title={column.title}
            width={column.width}
            onSortChange={onSortChange}
          >
            {column.render({
              compliance: COMPLIANCE.UNDEFINED,
              hosts: {count: 0, hostsByIp: {}, complianceByIp: {}},
              severity: undefined,
              cpe: '',
              name: '',
            } as ReportOperatingSystem)}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};

const Row = ({entity, audit = false}) => {
  const columns = getColumns(audit);

  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key} align={column.align}>
          {column.render(entity)}
        </TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Operating Systems available'),
  row: Row,
});
