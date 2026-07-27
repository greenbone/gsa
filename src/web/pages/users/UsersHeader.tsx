/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/SelectionType';
import {type SortDirectionType} from 'web/utils/sort-direction';

interface UsersHeaderProps {
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
          sortBy={sort ? 'name' : undefined}
          title={_('Name')}
          width="20%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'roles' : undefined}
          title={_('Roles')}
          width="26%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'groups' : undefined}
          title={_('Groups')}
          width="26%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'host_access' : undefined}
          title={_('Host Access')}
          width="10%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sortBy={sort ? 'ldap' : undefined}
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
