/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type ReportPort from 'gmp/models/report/port';
import SeverityBar from 'web/components/bar/SeverityBar';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface ColumnConfig {
  key: string;
  title: string;
  width?: string;
  sortBy?: string;
  render: (entity: ReportPort, links?: boolean) => React.ReactNode;
}

interface HeaderProps {
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

const getColumns = (): ColumnConfig[] => [
  {
    key: 'port',
    title: _('Port'),
    sortBy: 'name',
    render: (entity: ReportPort) => entity.id,
  },
  {
    key: 'hosts',
    title: _('Hosts'),
    sortBy: 'hosts',
    render: (entity: ReportPort) => entity.hosts.count,
  },
  {
    key: 'severity',
    title: _('Severity'),
    width: '10%',
    sortBy: 'severity',
    render: (entity: ReportPort) => <SeverityBar severity={entity.severity} />,
  },
];

const Header = ({
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}: HeaderProps) => {
  const columns = getColumns();

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => (
          <TableHead
            key={column.key}
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sort={sort}
            sortBy={column.sortBy}
            title={column.title}
            width={column.width}
            onSortChange={onSortChange}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
};

const Row = ({entity, links = true}) => {
  const columns = getColumns();

  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key}>{column.render(entity, links)}</TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Ports available'),
  row: Row,
});
