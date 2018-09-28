/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {typeName, getEntityType} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import {
  renderComponent,
  permissionDescription,
} from 'web/utils/render';

import EntityNameTableData from 'web/entities/entitynametabledata';
import EntityLink from 'web/entity/link';
import {withEntityActions} from 'web/entities/actions';
import {withEntityRow} from 'web/entities/row';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const Actions = ({
  entity,
  onPermissionDeleteClick,
  onPermissionDownloadClick,
  onPermissionCloneClick,
  onPermissionEditClick,
}) => (
  <IconDivider
    align={['center', 'center']}
    grow
  >
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
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actions,
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
      {isDefined(entity.resource) &&
        <EntityLink entity={entity.resource}/>
      }
    </TableData>
    <TableData>
      {isDefined(entity.subject) && typeName(getEntityType(entity.subject))}
    </TableData>
    <TableData>
      {isDefined(entity.subject) &&
        <EntityLink entity={entity.subject}/>
      }
    </TableData>
    {renderComponent(actions, {...props, entity})}
  </TableRow>
);

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
