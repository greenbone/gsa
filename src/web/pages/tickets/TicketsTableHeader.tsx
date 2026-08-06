/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type ReactElement} from 'react';
import {_l} from 'gmp/locale/lang';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import useTranslation from 'web/hooks/useTranslation';
import SelectionType, {type SelectionTypeType} from 'web/utils/selection-type';
import {type SortDirectionType} from 'web/utils/sort-direction';

export interface TicketField {
  name: string;
  displayName: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TicketsHeaderProps {
  actionsColumn?: ReactElement | null;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  selectionType?: SelectionTypeType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

export const TICKET_FIELDS: TicketField[] = [
  {name: 'name', displayName: String(_l('Vulnerability')), width: '20%'},
  {name: 'severity', displayName: String(_l('Severity')), width: '10%'},
  {name: 'host', displayName: String(_l('Host')), width: '15%'},
  {
    name: 'solution_type',
    displayName: String(_l('Solution Type')),
    width: '8%',
  },
  {name: 'username', displayName: String(_l('Assigned User')), width: '15%'},
  {
    name: 'modified',
    displayName: String(_l('Modification Time')),
    width: '15%',
  },
  {name: 'status', displayName: String(_l('Status')), width: '10%'},
];

const TicketsHeader = ({
  actionsColumn,
  selectionType,
  sort = true,
  currentSortBy,
  currentSortDir,
  onSortChange,
}: TicketsHeaderProps) => {
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
        {TICKET_FIELDS.map(({name, displayName, width, align}) => (
          <TableHead
            key={name}
            align={align}
            currentSortBy={currentSortBy}
            currentSortDir={currentSortDir}
            sort={sort}
            sortBy={name}
            title={String(displayName)}
            width={width}
            onSortChange={onSortChange}
          />
        ))}
        {column}
      </TableRow>
    </TableHeader>
  );
};

export default TicketsHeader;
