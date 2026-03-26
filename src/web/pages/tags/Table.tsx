/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {_l} from 'gmp/locale/lang';
import type Tag from 'gmp/models/tag';
import {typeName} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';

import DateTime from 'web/components/date/DateTime';
import {DisableIcon, EnableIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableHead from 'web/components/table/TableHead';
import TableHeader from 'web/components/table/TableHeader';
import TableRow from 'web/components/table/TableRow';
import createEntitiesFooter, {
  type CreateEntitiesFooterProps,
} from 'web/entities/createEntitiesFooter';
import createEntitiesTable from 'web/entities/createEntitiesTable';
import EntitiesActions, {
  type EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import type {ActionsColumn} from 'web/entities/withEntitiesHeader';
import withRowDetails from 'web/entities/withRowDetails';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import TagDetails from 'web/pages/tags/Details';
import {renderYesNo} from 'web/utils/Render';
import type {SortDirectionType} from 'web/utils/sort-direction';

export interface TagActionsProps extends Omit<
  EntitiesActionsProps<Tag>,
  'children'
> {
  onTagCloneClick?: (entity: Tag) => void;
  onTagDeleteClick?: (entity: Tag) => void;
  onTagDownloadClick?: (entity: Tag) => void;
  onTagEditClick?: (entity: Tag) => void;
  onTagDisableClick?: (entity: Tag) => void;
  onTagEnableClick?: (entity: Tag) => void;
}

export interface TagTableHeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

interface ColumnConfig {
  key: string;
  title: string;
  width: string;
  sortBy?: string;
  align?: string;
  render: (
    entity: Tag,
    onToggleDetailsClick?: () => void,
    links?: boolean,
  ) => React.ReactNode;
}

interface TagRowProps {
  entity: Tag;
  links?: boolean;
  onToggleDetailsClick?: () => void;
  'data-testid'?: string;
}

type TagRowInternalProps = TagRowProps & TagActionsProps;

interface HeaderProps {
  actionsColumn?: ActionsColumn;
  sort?: boolean;
  currentSortBy?: string;
  currentSortDir?: SortDirectionType;
  onSortChange?: (sortBy: string) => void;
}

interface RowProps extends TagRowInternalProps {
  links?: boolean;
  onToggleDetailsClick?: () => void;
}

const getCoreColumns = (): ColumnConfig[] => [
  {
    key: 'name',
    title: _l('Name') as unknown as string,
    width: '30%',
    sortBy: 'name',
    render: (entity: Tag, onToggleDetailsClick, links = true) => (
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
    title: _l('Value') as unknown as string,
    width: '30%',
    sortBy: 'value',
    render: (entity: Tag) => entity.value,
  },
  {
    key: 'active',
    title: _l('Active') as unknown as string,
    width: '8%',
    sortBy: 'active',
    render: (entity: Tag) => renderYesNo(entity.isActive()),
  },
  {
    key: 'resource_type',
    title: _l('Resource Type') as unknown as string,
    width: '8%',
    sortBy: 'resource_type',
    render: (entity: Tag) => typeName(entity.resourceType),
  },
  {
    key: 'resourceCount',
    title: _l('Number of Resources') as unknown as string,
    width: '8%',
    render: (entity: Tag) => entity.resourceCount,
  },
  {
    key: 'modified',
    title: _l('Modified') as unknown as string,
    width: '8%',
    sortBy: 'modified',
    render: (entity: Tag) => <DateTime date={entity.modificationTime} />,
  },
];

const Actions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onTagCloneClick,
  onTagDeleteClick,
  onTagDownloadClick,
  onTagEditClick,
  onTagDisableClick,
  onTagEnableClick,
}: TagActionsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  const iconComponent = entity.isActive() ? (
    <DisableIcon
      title={_('Disable Tag')}
      value={entity}
      onClick={onTagDisableClick}
    />
  ) : (
    <EnableIcon
      title={_('Enable Tag')}
      value={entity}
      onClick={onTagEnableClick}
    />
  );

  const toggleIcon = capabilities.mayEdit('tag') ? iconComponent : null;

  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        {toggleIcon}
        <TrashIcon
          displayName={_('Tag')}
          entity={entity}
          name="tag"
          onClick={onTagDeleteClick}
        />
        <EditIcon
          displayName={_('Tag')}
          entity={entity}
          name="tag"
          onClick={onTagEditClick}
        />
        <CloneIcon
          displayName={_('Tag')}
          entity={entity}
          name="tag"
          title={_('Clone Tag')}
          onClick={onTagCloneClick}
        />
        <ExportIcon
          title={_('Export Tag')}
          value={entity}
          onClick={onTagDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

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

const Row = ({
  entity,
  links = true,
  onToggleDetailsClick,
  ...actionProps
}: RowProps) => {
  const columns = getCoreColumns();

  return (
    <TableRow data-testid={actionProps['data-testid']}>
      {columns.map(column => (
        <TableData key={column.key} align={column.align}>
          {column.render(entity, onToggleDetailsClick, links)}
        </TableData>
      ))}
      <Actions entity={entity} {...actionProps} />
    </TableRow>
  );
};

export {Row, type TagActionsProps as TagActionsPropsExport};

export default createEntitiesTable<
  Tag,
  CreateEntitiesFooterProps<Tag>,
  HeaderProps,
  RowProps
>({
  emptyTitle: _l('No tags available'),
  header: Header,
  row: Row,
  rowDetails: withRowDetails('tag')(TagDetails),
  footer: createEntitiesFooter({
    download: 'tags.xml',
    span: 7,
    trash: true,
  }),
});
