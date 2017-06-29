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

import PropTypes from '../../utils/proptypes.js';
import {
  render_component,
  type_name,
  permission_description,
} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import EntityLink from '../../entities/link.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import Layout from '../../components/layout/layout.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const Actions = ({
    entity,
    onDownloadPermissionInstaller,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
    onVerifyPermission,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Permission')}
        name="permission"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Permission')}
        name="permission"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Permission')}
        name="permission"
        entity={entity}
        title={_('Clone Permission')}
        value={entity}
        mayClone={entity.isWriteable()}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Permission')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onDownloadPermissionInstaller: PropTypes.func,
  onEntityEdit: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onVerifyPermission: PropTypes.func,
};

const Row = ({
    actions,
    entity,
    links = true,
    ...props
  }, {
    capabilities,
    username,
  }) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="permission"
        displayName={_('Permission')}
        userName={username}/>
      <TableData>
        {permission_description(entity.name, entity.resource)}
      </TableData>
      <TableData>
        {type_name(entity.resource.type)}
      </TableData>
      <TableData>
        <EntityLink entity={entity.resource}/>
      </TableData>
      <TableData>
        {type_name(entity.subject.type)}
      </TableData>
      <TableData>
        <EntityLink entity={entity.subject}/>
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  username: PropTypes.string.isRequired,
};

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
