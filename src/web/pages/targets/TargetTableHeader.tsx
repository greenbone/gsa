/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {type ActionsColumn} from 'web/entities/withEntitiesHeader';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface TargetTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const TargetTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: TargetTableHeaderProps) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="name"
          title={_('Name')}
          width="30%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="hosts"
          title={_('Hosts')}
          width="20%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="ips"
          title={_('IPs')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="port_list"
          title={_('Port List')}
          width="15%"
          onSortChange={onSortChange}
        />
        <TableHead width="15%">{_('Credentials')}</TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" rowSpan={2} width="6em">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};

export default TargetTableHeader;
