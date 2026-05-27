/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type {ReportActiveCve} from 'gmp/models/report/parser';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import CveLink from 'web/components/link/CveLink';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import type {SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  currentSortDir?: SortDirectionType;
  currentSortBy?: string;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

const getColumns = () => [
  {
    key: 'cve',
    sortBy: 'cve',
    title: _('CVE'),
    render: (entity: ReportActiveCve) => (
      <span>
        <CveLink id={entity.cveId} />
      </span>
    ),
  },
  {
    key: 'host',
    sortBy: 'host',
    title: _('Host'),
    render: (entity: ReportActiveCve) =>
      isDefined(entity.host.id) ? (
        <span>
          <DetailsLink id={entity.host.id} type="host">
            {entity.host.ip}
          </DetailsLink>
        </span>
      ) : (
        <Link filter={'name=' + entity.host.ip} to="hosts">
          {entity.host.ip}
        </Link>
      ),
  },
  {
    key: 'nvt',
    sortBy: 'nvt',
    title: _('NVT'),
    render: (entity: ReportActiveCve) => (
      <span>
        <DetailsLink id={entity.source?.name ?? ''} type="nvt">
          {entity.source?.description}
        </DetailsLink>
      </span>
    ),
  },
  {
    key: 'severity',
    sortBy: 'severity',
    title: _('Severity'),
    width: '10%',
    render: (entity: ReportActiveCve) => (
      <SeverityBar severity={entity.severity} />
    ),
  },
];

const Header = ({
  currentSortDir,
  currentSortBy,
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
            sortBy={sort ? column.sortBy : undefined}
            title={column.title}
            width={column.width}
            onSortChange={onSortChange}
          />
        ))}
      </TableRow>
    </TableHeader>
  );
};

const Row = ({entity}) => {
  const columns = getColumns();
  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key}>{column.render(entity)}</TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No CVEs available'),
  row: Row,
});
