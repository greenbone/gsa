/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */



import _ from 'gmp/locale';
import {typeName, getEntityType} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import ExportIcon from 'web/components/icon/exporticon';
import IconDivider from 'web/components/layout/icondivider';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';
import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import EntityLink from 'web/entity/link';
import PropTypes from 'web/utils/proptypes';
import {permissionDescription} from 'web/utils/render';

const Actions = withEntitiesActions(
  ({
    entity,
    onPermissionDeleteClick,
    onPermissionDownloadClick,
    onPermissionCloneClick,
    onPermissionEditClick,
  }) => (
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
      <CloneIcon
        displayName={_('Permission')}
        entity={entity}
        mayClone={entity.isWritable()}
        name="permission"
        title={_('Clone Permission')}
        value={entity}
        onClick={onPermissionCloneClick}
      />
      <ExportIcon
        title={_('Export Permission')}
        value={entity}
        onClick={onPermissionDownloadClick}
      />
    </IconDivider>
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => (
  <TableRow>
    <EntityNameTableData
      displayName={_('Permission')}
      entity={entity}
      link={links}
      type="permission"
      onToggleDetailsClick={onToggleDetailsClick}
    />
    <TableData>
      {permissionDescription(entity.name, entity.resource, entity.subject)}
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

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
