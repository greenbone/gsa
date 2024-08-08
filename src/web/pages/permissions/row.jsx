/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {typeName, getEntityType} from 'gmp/utils/entitytype';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import EntityLink from 'web/entity/link';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

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
    <IconDivider align={['center', 'center']} grow>
      <TrashIcon
        displayName={_('Permission')}
        name="permission"
        entity={entity}
        onClick={onPermissionDeleteClick}
      />
      <EditIcon
        displayName={_('Permission')}
        name="permission"
        entity={entity}
        onClick={onPermissionEditClick}
      />
      <CloneIcon
        displayName={_('Permission')}
        name="permission"
        entity={entity}
        title={_('Clone Permission')}
        value={entity}
        mayClone={entity.isWritable()}
        onClick={onPermissionCloneClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Permission')}
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
      entity={entity}
      link={links}
      type="permission"
      displayName={_('Permission')}
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
