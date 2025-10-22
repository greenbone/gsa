/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {type ActionsColumn} from 'web/entities/withEntitiesHeader';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/SortDirection';

export interface AgentInstallerTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const AgentInstallerTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: AgentInstallerTableHeaderProps) => {
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
          width="25%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="description"
          title={_('Description')}
          width="25%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="version"
          title={_('Version')}
          width="10%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy={'modified'}
          title={_('Last Modified')}
          width="25%"
          onSortChange={onSortChange}
        />
        {actionsColumn ?? (
          <TableHead align="center" width="10%">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};

export default AgentInstallerTableHeader;
