/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type ReportApp from 'gmp/models/report/app';
import SeverityBar from 'web/components/bar/SeverityBar';
import CpeIcon from 'web/components/icon/CpeIcon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import type {SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

interface ColumnsProps {
  links?: boolean;
}

const getColumns = ({links = true}: ColumnsProps) => [
  {
    key: 'name',
    title: _('Application CPE'),
    sortBy: 'name',
    render: (entity: ReportApp) => {
      const {id, name} = entity;
      return (
        <span>
          <DetailsLink id={id || name || ''} textOnly={!links} type="cpe">
            <IconDivider>
              <CpeIcon name={name || ''} />
              <span>{name}</span>
            </IconDivider>
          </DetailsLink>
        </span>
      );
    },
  },
  {
    key: 'hosts',
    title: _('Hosts'),
    sortBy: 'hosts',
    render: (entity: ReportApp) => entity.hosts.count,
  },
  {
    key: 'occurrences',
    title: _('Occurrences'),
    sortBy: 'occurrences',
    render: (entity: ReportApp) => entity.occurrences.total,
  },
  {
    key: 'severity',
    title: _('Severity'),
    sortBy: 'severity',
    render: (entity: ReportApp) => <SeverityBar severity={entity.severity} />,
  },
];

const Header = ({
  currentSortBy,
  currentSortDir,
  sort = true,
  onSortChange,
}: HeaderProps) => {
  const columns = getColumns({});
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
            onSortChange={onSortChange}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
};

const Row = ({entity, links = true}) => {
  const columns = getColumns({links});
  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key}>{column.render(entity)}</TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  emptyTitle: _l('No Applications available'),
  header: Header,
  row: Row,
});
