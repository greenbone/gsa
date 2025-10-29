/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {isDefined} from 'gmp/utils/identity';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import type {ActionsColumn} from 'web/entities/withEntitiesHeader';
import useTranslation from 'web/hooks/useTranslation';
import type {SortDirectionType} from 'web/utils/sort-direction';

export interface ContainerImageTargetTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

const ContainerImageTargetTableHeader = ({
  actionsColumn,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: ContainerImageTargetTableHeaderProps) => {
  const [_] = useTranslation();
  return (
    <TableHeader>
      <TableRow>
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy={'name'}
          title={_('Name')}
          width="30%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy={'image_references'}
          title={_('Image References')}
          width="30%"
          onSortChange={onSortChange}
        />
        <TableHead title={_('Credential')} width="15%" />
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

export default ContainerImageTargetTableHeader;
