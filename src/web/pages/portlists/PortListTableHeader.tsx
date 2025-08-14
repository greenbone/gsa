/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {ActionsColumn} from 'web/entities/withEntitiesHeader';
import useTranslation from 'web/hooks/useTranslation';
import {SortDirectionType} from 'web/utils/SortDirection';

export interface PortListTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const PortListTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: PortListTableHeaderProps) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          rowSpan={2}
          sort={sort}
          sortBy={'name'}
          title={_('Name')}
          width="59%"
          onSortChange={onSortChange}
        />
        <TableHead colSpan={3} width="33%">
          {_('Port Counts')}
        </TableHead>
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" rowSpan={2} width="6em">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy={'total'}
          title={_('Total')}
          width="11%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy={'tcp'}
          title={_('TCP')}
          width="11%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy={'udp'}
          title={_('UDP')}
          width="11%"
          onSortChange={onSortChange}
        />
      </TableRow>
    </TableHeader>
  );
};

export default PortListTableHeader;
