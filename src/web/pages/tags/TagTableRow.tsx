/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {_} from 'gmp/locale/lang';
import type Tag from 'gmp/models/tag';
import {typeName} from 'gmp/utils/entity-type';
import DateTime from 'web/components/date/DateTime';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import TagTableActions, {
  type TagTableActionsProps,
} from 'web/pages/tags/TagTableActions';
import {renderYesNo} from 'web/utils/Render';

interface ColumnConfig {
  key: string;
  title: string;
  width: string;
  sortBy?: string;
  align?: string;
  render: (
    entity: Tag,
    onToggleDetailsClick?: (entity: Tag) => void,
    links?: boolean,
  ) => React.ReactNode;
}

export interface TagTableRowProps extends TagTableActionsProps {
  actionsComponent?: React.ComponentType<TagTableActionsProps>;
  'data-testid'?: string;
  links?: boolean;
  onToggleDetailsClick?: (entity: Tag) => void;
}

export const getCoreColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    title: _('Name'),
    width: '30%',
    sortBy: 'name',
    render: (entity, onToggleDetailsClick, links = true) => (
      <EntityNameTableData
        displayName="Tag"
        entity={entity}
        links={links}
        type="tag"
        onToggleDetailsClick={onToggleDetailsClick}
      />
    ),
  },
  {
    key: 'value',
    title: _('Value'),
    width: '30%',
    sortBy: 'value',
    render: entity => entity.value,
  },
  {
    key: 'active',
    title: _('Active'),
    width: '8%',
    sortBy: 'active',
    render: entity => renderYesNo(entity.isActive()),
  },
  {
    key: 'resource_type',
    title: _('Resource Type'),
    width: '8%',
    sortBy: 'resource_type',
    render: entity => typeName(entity.resourceType),
  },
  {
    key: 'resourceCount',
    title: _('Number of Resources'),
    width: '8%',
    render: entity => entity.resourceCount,
  },
  {
    key: 'modified',
    title: _('Modified'),
    width: '8%',
    sortBy: 'modified',
    render: entity => <DateTime date={entity.modificationTime} />,
  },
];

const TagTableRow = ({
  actionsComponent: ActionsComponent = TagTableActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...actionProps
}: TagTableRowProps) => {
  const columns = getCoreColumns();
  return (
    <TableRow data-testid={actionProps['data-testid']}>
      {columns.map(column => (
        <TableData key={column.key} align={column.align}>
          {column.render(entity, onToggleDetailsClick, links)}
        </TableData>
      ))}
      <ActionsComponent entity={entity} {...actionProps} />
    </TableRow>
  );
};

export default TagTableRow;
