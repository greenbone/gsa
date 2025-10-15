/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import withEntitiesHeader, {
  type ActionsColumn,
} from 'web/entities/withEntitiesHeader';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/SortDirection';

export interface HeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const Header = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: HeaderProps) => {
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
          width="92%"
          onSortChange={onSortChange}
        />
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

export default withEntitiesHeader<HeaderProps>()(Header);
