/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_l} from 'gmp/locale/lang';
import type Tag from 'gmp/models/tag';
import {isDefined} from 'gmp/utils/identity';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {type ActionsColumn} from 'web/entities/withEntitiesHeader';
import withRowDetails from 'web/entities/withRowDetails';
import useTranslation from 'web/hooks/useTranslation';
import TagDetails from 'web/pages/tags/TagDetails';
import TagTableRow, {
  getCoreColumns,
  type TagTableRowProps,
} from 'web/pages/tags/TagTableRow';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface TagTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

interface HeaderProps {
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
  const columns = getCoreColumns();

  return (
    <TableHeader>
      <TableRow>
        {columns.map(column => (
          <TableHead
            key={column.key}
            align={column.align}
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sort={sort && isDefined(column.sortBy)}
            sortBy={column.sortBy}
            title={column.title}
            width={column.width}
            onSortChange={onSortChange}
          />
        ))}
        {isDefined(actionsColumn) ? (
          actionsColumn
        ) : (
          <TableHead align="center" width="10%">
            {_('Actions')}
          </TableHead>
        )}
      </TableRow>
    </TableHeader>
  );
};

export default createEntitiesTable<
  Tag,
  CreateEntitiesFooterProps<Tag>,
  HeaderProps,
  TagTableRowProps
>({
  emptyTitle: _l('No tags available'),
  header: Header,
  row: TagTableRow,
  rowDetails: withRowDetails('tag')(TagDetails),
  footer: createEntitiesFooter({download: 'tags.xml', span: 7, trash: true}),
});
