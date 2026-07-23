/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface VulnerabilitiesTableHeaderProps {
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  actionsColumn?: React.ReactElement;
  hideColumns?: Record<string, boolean>;
  onSortChange?: (sortBy: string) => void;
}

const VulnerabilitiesTableHeader = ({
  sort = true,
  currentSortBy,
  currentSortDir,
  actionsColumn,
  hideColumns = {},
  onSortChange,
}: VulnerabilitiesTableHeaderProps) => {
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
          width="40%"
          onSortChange={onSortChange}
        />
        {hideColumns.oldest !== true && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sort={sort}
            sortBy="oldest"
            title={_('Oldest Result')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
        {hideColumns.oldest !== true && (
          <TableHead
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sort={sort}
            sortBy="newest"
            title={_('Newest Result')}
            width="15%"
            onSortChange={onSortChange}
          />
        )}
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="severity"
          title={_('Severity')}
          width="8%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="qod"
          title={_('QoD')}
          width="4%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="results"
          title={_('Results')}
          width="5%"
          onSortChange={onSortChange}
        />
        <TableHead
          currentSortBy={currentSortBy}
          currentSortDir={currentSortDir}
          sort={sort}
          sortBy="hosts"
          title={_('Hosts')}
          width="5%"
          onSortChange={onSortChange}
        />
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );
};

export default VulnerabilitiesTableHeader;
