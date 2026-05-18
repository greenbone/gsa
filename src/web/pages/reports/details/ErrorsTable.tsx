/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import type Model from 'gmp/models/model';
import type {ReportError} from 'gmp/models/report/parser';
import {isDefined} from 'gmp/utils/identity';
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

interface RowProps {
  entity: Model;
  links?: boolean;
}

interface ColumnsProps {
  links?: boolean;
}

const getColumns = ({links = true}: ColumnsProps) => [
  {
    key: 'error',
    title: _('Error Message'),
    sortBy: 'error',
    render: (entity: ReportError) => entity.description,
  },
  {
    key: 'host',
    title: _('Host'),
    sortBy: 'host',
    render: (entity: ReportError) => {
      const {host} = entity;
      return isDefined(host) && isDefined(host.id) ? (
        <span>
          <DetailsLink id={host.id} textOnly={!links} type="host">
            {host.ip}
          </DetailsLink>
        </span>
      ) : (
        host?.ip
      );
    },
  },
  {
    key: 'hostname',
    title: _('Hostname'),
    sortBy: 'hostname',
    render: (entity: ReportError) => <i>{entity.host?.name}</i>,
  },
  {
    key: 'nvt',
    title: _('NVT'),
    sortBy: 'nvt',
    render: (entity: ReportError) => {
      const {nvt} = entity;
      return isDefined(nvt.id) ? (
        <span>
          <DetailsLink id={nvt.id} textOnly={!links} type="nvt">
            {nvt.name}
          </DetailsLink>
        </span>
      ) : (
        nvt?.name
      );
    },
  },
  {
    key: 'port',
    title: _('Port'),
    sortBy: 'port',
    render: (entity: ReportError) => entity.port,
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

const Row = ({entity, links = true}: RowProps) => {
  const errorEntity = entity as unknown as ReportError;
  const columns = getColumns({links});
  return (
    <TableRow>
      {columns.map(column => (
        <TableData key={column.key}>{column.render(errorEntity)}</TableData>
      ))}
    </TableRow>
  );
};

export default createEntitiesTable({
  header: Header,
  emptyTitle: _l('No Errors available'),
  row: Row,
});
