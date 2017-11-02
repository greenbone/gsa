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
import {map} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import DeleteIcon from '../../entity/icon/deleteicon.js';
import EditIcon from '../../entity/icon/editicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import IconDivider from '../../components/layout/icondivider.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import './css/row.css';
import {convert_auth_method, convert_allow} from './details.js';

const IconActions = ({
    entity,
    onEditUser,
    onEntityClone,
    onEntityDelete,
    onEntityDownload,
  }) => {
  return (
    <IconDivider>
      <DeleteIcon
        displayName={_('User')}
        name="user"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('User')}
        name="user"
        entity={entity}
        onClick={onEditUser}/>
      <CloneIcon
        displayName={_('User')}
        name="user"
        entity={entity}
        title={_('Clone User')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export User')}
        onClick={onEntityDownload}
      />
    </IconDivider>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onEditUser: PropTypes.func,
  onEntityClone: PropTypes.func,
};

const Row = ({
  actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const roles = map(entity.roles, role => (
    <DetailsLink
      legacy
      textOnly={!links}
      key={role.id}
      type="role"
      id={role.id}>
      {role.name}
    </DetailsLink>
  ));

  const groups = map(entity.groups, group => (
    <DetailsLink
      legacy
      textOnly={!links}
      type="group"
      key={group.id}
      id={group.id}>
      {group.name}
    </DetailsLink>
  ));

  const auth_method = convert_auth_method(entity.auth_method);
  const host_allow = convert_allow(entity.hosts);
  return (
    <TableRow>
      <EntityNameTableData
        legacy
        entity={entity}
        link={links}
        type="user"
        displayName={_('User')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData flex className="roles">
        {roles}
      </TableData>
      <TableData flex className="groups">
        {groups}
      </TableData>
      <TableData>
        {host_allow}
      </TableData>
      <TableData>
        {auth_method}
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(IconActions))(Row);

// vim: set ts=2 sw=2 tw=80:
