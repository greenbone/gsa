/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_, _l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import VulnsRow from 'web/pages/vulns/VulnsRow';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface HeaderProps {
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  actionsColumn?: React.ReactElement;
  hideColumns?: Record<string, boolean>;
  onSortChange?: (sortBy: string) => void;
}

const Header = ({
  sort = true,
  currentSortBy,
  currentSortDir,
  actionsColumn,
  hideColumns = {},
  onSortChange,
}: HeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'name' : undefined}
          title={_('Name')}
          width="40%"
          onSortChange={onSortChange}
        />
        {hideColumns.oldest !== true && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'oldest' : undefined}
            title={_('Oldest Result')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
        {hideColumns.oldest !== true && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sortBy={sort ? 'newest' : undefined}
            title={_('Newest Result')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'severity' : undefined}
          title={_('Severity')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'qod' : undefined}
          title={_('QoD')}
          width="4%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'results' : undefined}
          title={_('Results')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'hosts' : undefined}
          title={_('Hosts')}
          width="5%"
          onSortChange={onSortChange}
        />
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

const Footer = createEntitiesFooter({
  span: 8,
  download: 'vulnerabilities.xml',
});

export const VulnsTable = createEntitiesTable({
  emptyTitle: _l('No Vulnerabilities available'),
  header: Header,
  footer: Footer,
  row: VulnsRow,
  // @ts-expect-error toggleDetailsIcon is not in CreateEntitiesTableOptions but is passed to EntitiesTable
  toggleDetailsIcon: false,
});

export default VulnsTable;
