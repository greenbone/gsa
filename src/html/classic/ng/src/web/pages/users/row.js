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
import {is_empty, map} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import DeleteIcon from '../../entities/icons/entitydeleteicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import './css/row.css';

const IconActions = ({
    entity,
    onEditUser,
    onEntityClone,
    onEntityDelete,
    onEntityDownload,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
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
    </Layout>
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
    ...props
  }, {
    capabilities,
    username,
  }) => {

  let roles;

  if (capabilities.mayAccess('roles')) {
    roles = map(entity.roles, role => (
      <DetailsLink
        className="item"
        legacy
        key={role.id}
        type="role"
        id={role.id}>
        {role.name}
      </DetailsLink>
    ));
  }
  else {
    roles = map(entity.roles, role => {
      return (
        <span
          className="item">
          {role.name}
        </span>
      );
    });
  }

  let groups;

  if (capabilities.mayAccess('groups')) {
    groups = map(entity.groups, group => {
      return (
        <DetailsLink
          className="item"
          legacy
          type="group"
          key={group.id}
          id={group.id}>
          {group.name}
        </DetailsLink>
      );
    });
  }
  else {
    groups = map(entity.groups, group => {
      return (
        <span
          className="item">
          {group.name}
        </span>
      );
    });
  }

  let auth_method;
  if (entity.auth_method === 'ldap_connect') {
    auth_method = _('LDAP');
  }
  else if (entity.auth_method === 'radius_connect') {
    auth_method = _('RADIUS');
  }
  else {
    auth_method = _('Local');
  }

  let host_allow = '';
  if (entity.hosts.allow === '0') {
    if (is_empty(entity.hosts.addresses)) {
      host_allow = _('Allow all');
    }
    else {
      host_allow = _('Allow all and deny from {{addresses}}', entity.hosts);
    }
  }
  else if (entity.hosts.allow === '1') {
    if (is_empty(entity.hosts.addresses)) {
      host_allow = _('Deny all');
    }
    else {
      host_allow = _('Deny all and allow from {{addresses}}', entity.hosts);
    }
  }

  return (
    <TableRow>
      <EntityNameTableData
        legacy
        entity={entity}
        link={links}
        type="user"
        displayName={_('User')}
        userName={username}/>
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
};

Row.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  username: PropTypes.string.isRequired,
};

export default withEntityRow(Row, withEntityActions(IconActions));

// vim: set ts=2 sw=2 tw=80:
