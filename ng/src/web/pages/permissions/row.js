/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {
  render_component,
  type_name,
  permission_description,
} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import EntityLink from '../../entity/link.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const Actions = ({
  entity,
  onPermissionDeleteClick,
  onPermissionDownloadClick,
  onPermissionCloneClick,
  onPermissionEditClick,
}) => (
  <IconDivider
    flex
    grow
    align={['center', 'center']}
  >
    <TrashIcon
      displayName={_('Permission')}
      name="permission"
      entity={entity}
      onClick={onPermissionDeleteClick}/>
    <EditIcon
      displayName={_('Permission')}
      name="permission"
      entity={entity}
      onClick={onPermissionEditClick}/>
    <CloneIcon
      displayName={_('Permission')}
      name="permission"
      entity={entity}
      title={_('Clone Permission')}
      value={entity}
      mayClone={entity.isWritable()}
      onClick={onPermissionCloneClick}/>
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
      {permission_description(entity.name, entity.resource)}
    </TableData>
    <TableData>
      {is_defined(entity.resource) && type_name(entity.resource.entity_type)}
    </TableData>
    <TableData>
      {is_defined(entity.resource) &&
        <EntityLink entity={entity.resource}/>
      }
    </TableData>
    <TableData>
      {is_defined(entity.subject) && type_name(entity.subject.entity_type)}
    </TableData>
    <TableData>
      {is_defined(entity.subject) &&
        <EntityLink entity={entity.subject}/>
      }
    </TableData>
    {render_component(actions, {...props, entity})}
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
