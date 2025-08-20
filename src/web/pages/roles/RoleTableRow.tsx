/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Role from 'gmp/models/role';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableRow from 'web/components/table/TableRow';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import {SelectionTypeType} from 'web/utils/SelectionType';

export interface RoleActionsProps {
  entity: Role;
  selectionType?: SelectionTypeType;
  onRoleCloneClick?: (role: Role) => void;
  onRoleDeleteClick?: (role: Role) => void;
  onRoleDownloadClick?: (role: Role) => void;
  onRoleEditClick?: (role: Role) => void;
  onEntitySelected?: (role: Role) => void;
  onEntityDeselected?: (role: Role) => void;
}

export interface RoleTableRowProps extends RoleActionsProps {
  actionsComponent?: React.ComponentType<RoleActionsProps>;
  links?: boolean;
  'data-testid'?: string;
  onToggleDetailsClick?: (entity: Role) => void;
}

const Actions = withEntitiesActions(
  ({
    entity,
    onRoleCloneClick,
    onRoleDeleteClick,
    onRoleDownloadClick,
    onRoleEditClick,
  }: RoleActionsProps) => {
    const [_] = useTranslation();

    return (
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Role')}
          entity={entity}
          name="role"
          onClick={onRoleDeleteClick}
        />
        <EditIcon
          displayName={_('Role')}
          entity={entity}
          name="role"
          onClick={onRoleEditClick}
        />
        <CloneIcon
          displayName={_('Role')}
          entity={entity}
          name="role"
          title={_('Clone Role')}
          onClick={onRoleCloneClick}
        />
        <ExportIcon
          title={_('Export Role')}
          value={entity}
          onClick={onRoleDownloadClick}
        />
      </IconDivider>
    );
  },
);

const RoleTableRow = ({
  actionsComponent:
    ActionsComponent = Actions as unknown as React.ComponentType<RoleActionsProps>,
  entity,
  links = true,
  onToggleDetailsClick,
  selectionType,
  'data-testid': dataTestId,
  onEntityDeselected,
  onEntitySelected,
  onRoleCloneClick,
  onRoleDeleteClick,
  onRoleDownloadClick,
  onRoleEditClick,
}: RoleTableRowProps) => {
  const [_] = useTranslation();

  return (
    <TableRow data-testid={dataTestId}>
      <EntityNameTableData
        displayName={_('Role')}
        entity={entity}
        links={links}
        type="role"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <ActionsComponent
        entity={entity}
        selectionType={selectionType}
        onEntityDeselected={onEntityDeselected}
        onEntitySelected={onEntitySelected}
        onRoleCloneClick={onRoleCloneClick}
        onRoleDeleteClick={onRoleDeleteClick}
        onRoleDownloadClick={onRoleDownloadClick}
        onRoleEditClick={onRoleEditClick}
      />
    </TableRow>
  );
};

export default RoleTableRow;
