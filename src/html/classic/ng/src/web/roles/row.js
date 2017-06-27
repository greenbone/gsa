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

import _ from '../../locale.js';

import Layout from '../components/layout/layout.js';

import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';
import EditIcon from '../entities/icons/entityediticon.js';

import ExportIcon from '../components/icon/exporticon.js';

import TableRow from '../table/row.js';

const IconActions = ({
    entity,
    onEditRole,
    onEntityClone,
    onEntityDelete,
    onEntityDownload,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Role')}
        name="role"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Role')}
        name="role"
        entity={entity}
        onClick={onEditRole}/>
      <CloneIcon
        displayName={_('Role')}
        name="user"
        entity={entity}
        title={_('Clone Role')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Role')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onEditRole: PropTypes.func,
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
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="role"
        displayName={_('Role')}
        userName={username}/>
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
