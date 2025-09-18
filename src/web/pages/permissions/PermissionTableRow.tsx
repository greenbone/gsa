/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Permission from 'gmp/models/permission';
import {typeName, getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesActions, {
  EntitiesActionsProps,
} from 'web/entities/EntitiesActions';
import EntityNameTableData from 'web/entities/EntityNameTableData';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import EntityLink from 'web/entity/Link';
import useTranslation from 'web/hooks/useTranslation';
import {permissionDescription} from 'web/utils/Render';

export interface PermissionActionsProps
  extends Omit<EntitiesActionsProps<Permission>, 'children'> {
  onPermissionCloneClick?: (permission: Permission) => void;
  onPermissionDeleteClick?: (permission: Permission) => void;
  onPermissionDownloadClick?: (permission: Permission) => void;
  onPermissionEditClick?: (permission: Permission) => void;
}

export interface PermissionTableRowProps extends PermissionActionsProps {
  actionsComponent?: React.ComponentType<PermissionActionsProps>;
  links?: boolean;
  'data-testid'?: string;
  onToggleDetailsClick: (entity: Permission) => void;
}

const Actions = ({
  'data-testid': dataTestId,
  entity,
  selectionType,
  onEntityDeselected,
  onEntitySelected,
  onPermissionDeleteClick,
  onPermissionDownloadClick,
  onPermissionCloneClick,
  onPermissionEditClick,
}: PermissionActionsProps) => {
  const [_] = useTranslation();

  return (
    <EntitiesActions
      data-testid={dataTestId}
      entity={entity}
      selectionType={selectionType}
      onEntityDeselected={onEntityDeselected}
      onEntitySelected={onEntitySelected}
    >
      <IconDivider grow align={['center', 'center']}>
        <TrashIcon
          displayName={_('Permission')}
          entity={entity}
          name="permission"
          onClick={onPermissionDeleteClick}
        />
        <EditIcon
          displayName={_('Permission')}
          entity={entity}
          name="permission"
          onClick={onPermissionEditClick}
        />
        <CloneIcon<Permission>
          displayName={_('Permission')}
          entity={entity}
          mayClone={entity.isWritable()}
          name="permission"
          onClick={onPermissionCloneClick}
        />
        <ExportIcon
          title={_('Export Permission')}
          value={entity}
          onClick={onPermissionDownloadClick}
        />
      </IconDivider>
    </EntitiesActions>
  );
};

const PermissionTableRow = ({
  actionsComponent:
    ActionsComponent = Actions as unknown as React.ComponentType<PermissionActionsProps>,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}: PermissionTableRowProps) => {
  const [_] = useTranslation();

  return (
    <TableRow>
      <EntityNameTableData
        displayName={_('Permission')}
        entity={entity}
        links={links}
        type="permission"
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        {permissionDescription(
          entity.name as string,
          entity.resource,
          entity.subject,
        )}
      </TableData>
      <TableData>
        {isDefined(entity.resource) && typeName(getEntityType(entity.resource))}
      </TableData>
      <TableData>
        {isDefined(entity.resource) && (
          <span>
            <EntityLink entity={entity.resource} />
          </span>
        )}
      </TableData>
      <TableData>
        {isDefined(entity.subject) && typeName(getEntityType(entity.subject))}
      </TableData>
      <TableData>
        {isDefined(entity.subject) && (
          <span>
            <EntityLink entity={entity.subject} />
          </span>
        )}
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default PermissionTableRow;
