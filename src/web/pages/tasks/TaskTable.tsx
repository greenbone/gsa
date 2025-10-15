/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_, _l} from 'gmp/locale/lang';
import type Task from 'gmp/models/task';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import {type EntitiesFooterProps} from 'web/entities/EntitiesFooter';
import withEntitiesHeader, {
  type ActionsColumn,
} from 'web/entities/withEntitiesHeader';
import withRowDetails from 'web/entities/withRowDetails';
import TaskDetails from 'web/pages/tasks/TaskDetails';
import TaskRow, {type TaskRowProps} from 'web/pages/tasks/TaskRow';
import {type SortDirectionType} from 'web/utils/SortDirection';

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
  const sortProps = {
    currentSortBy,
    currentSortDir: currentSortDir as SortDirectionType,
    sort,
    onSortChange,
  };
  return (
    <TableHeader>
      <TableRow>
        <TableHead {...sortProps} sortBy="name" title={_('Name')} width="41%" />
        <TableHead
          {...sortProps}
          sortBy="status"
          title={_('Status')}
          width="8%"
        />
        <TableHead
          {...sortProps}
          sortBy="total"
          title={_('Reports')}
          width="6%"
        />
        <TableHead
          {...sortProps}
          sortBy="last"
          title={_('Last Report')}
          width="24%"
        />
        <TableHead
          {...sortProps}
          sortBy="severity"
          title={_('Severity')}
          width="8%"
        />
        <TableHead
          {...sortProps}
          align="center"
          sortBy="trend"
          title={_('Trend')}
          width="5%"
        />
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

const actionsColumn = (
  <TableHead align="center" title={_l('Actions')} width="10em" />
);

const TableFooter = createEntitiesFooter({
  span: 10,
  trash: true,
  download: 'tasks.xml',
});

const RowDetails = withRowDetails<Task>('task', 10)(TaskDetails);

const TaskTableHeader = withEntitiesHeader<HeaderProps>(actionsColumn)(Header);

export default createEntitiesTable<
  Task,
  EntitiesFooterProps<Task>,
  HeaderProps,
  TaskRowProps
>({
  emptyTitle: _l('No Tasks available'),
  row: TaskRow,
  rowDetails: RowDetails,
  header: TaskTableHeader,
  footer: TableFooter,
});
