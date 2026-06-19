/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import {type ActionsColumn} from 'web/entities/withEntitiesHeader';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface NoteTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const NoteTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: NoteTableHeaderProps) => {
  const [_] = useTranslation();
  const sortProps = {
    currentSortBy,
    currentSortDir: currentSortDir as SortDirectionType,
    sort,
    onSortChange,
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead {...sortProps} sortBy="text" title={_('Text')} width="20%" />
        <TableHead {...sortProps} sortBy="nvt" title={_('NVT')} width="35%" />
        <TableHead
          {...sortProps}
          sortBy="hosts"
          title={_('Hosts')}
          width="16%"
        />
        <TableHead
          {...sortProps}
          sortBy="port"
          title={_('Location')}
          width="16%"
        />
        <TableHead
          {...sortProps}
          sortBy="active"
          title={_('Active')}
          width="5%"
        />
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

export default NoteTableHeader;
