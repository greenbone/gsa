/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/selection-type';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface UsersHeaderProps {
  actionsColumn?: ReactElement | null;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  selectionType?: SelectionTypeType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

const UsersHeader = ({
  actionsColumn,
  selectionType,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: UsersHeaderProps) => {
  const [_] = useTranslation();

  let column = actionsColumn;
  column ??=
    selectionType === SelectionType.SELECTION_USER ? (
      <TableHead width="6em">{_('Actions')}</TableHead>
    ) : (
      <TableHead align="center" title={_('Actions')} width="8%" />
    );

  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="name"
          title={_('Name')}
          width="20%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="roles"
          title={_('Roles')}
          width="26%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="groups"
          title={_('Groups')}
          width="26%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="host_access"
          title={_('Host Access')}
          width="10%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="ldap"
          title={_('Authentication Type')}
          width="10%"
          onSortChange={onSortChange}
        />
        {column}
      </TableRow>
    </TableHeader>
  );
};

export default UsersHeader;
