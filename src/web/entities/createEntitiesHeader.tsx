/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import withEntitiesHeader, {
  ActionsColumn,
  WithEntitiesHeaderComponentProps,
} from 'web/entities/withEntitiesHeader';
import {SortDirectionType} from 'web/utils/SortDirection';

interface ToString {
  toString: () => string;
}

export interface CreateEntitiesHeaderProps
  extends WithEntitiesHeaderComponentProps {
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  sort?: boolean;
  onSortChange?: (sortBy: string) => void;
}

interface CreateEntitiesHeaderColumn {
  name: string;
  displayName: ToString;
  width: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * A higher order component to create table headers from a column description
 * array.
 *
 * @param columns - An array of column description objects in the form of:
 *                                  [{
 *                                      name: 'foo',
 *                                      displayName: _l('Foo'),
 *                                      width: '20%',
 *                                      align: ['center', 'center'],
 *                                   }, {
 *                                     ...
 *                                   }, ... ]
 * @param actionsColumn - React element, undefined, or boolean value.
 * @param options - Default properties for the Component.
 *
 * @return A new EntitiesHeader component.
 */
export function createEntitiesHeader(
  columns: CreateEntitiesHeaderColumn[],
  actionsColumn?: ActionsColumn,
  options: Partial<CreateEntitiesHeaderProps> = {},
) {
  const Header = ({
    actionsColumn,
    currentSortBy,
    currentSortDir,
    sort = true,
    onSortChange,
  }: CreateEntitiesHeaderProps) => (
    <TableHeader>
      <TableRow>
        {columns.map(column => {
          const {name, displayName, width, align} = column;
          return (
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
          );
        })}
        {actionsColumn}
      </TableRow>
    </TableHeader>
  );

  return withEntitiesHeader<CreateEntitiesHeaderProps>(
    actionsColumn,
    options,
  )(Header);
}

export default createEntitiesHeader;
