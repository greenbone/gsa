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

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../icons/exporticon.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';

const IconActions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEditPortList,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        entity={entity}
        displayName={_('Port List')}
        name="port_list"
        onClick={onEntityDelete}/>
      <EditIcon
        entity={entity}
        displayName={_('Port List')}
        name="port_list"
        onClick={onEditPortList}/>
      <CloneIcon
        entity={entity}
        displayName={_('Port List')}
        name="port_list"
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Port List')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model,
  onEntityDelete: React.PropTypes.func,
  onEntityDownload: React.PropTypes.func,
  onEditPortList: React.PropTypes.func,
  onEntityClone: React.PropTypes.func,
};

const Row = ({
    entity,
    links = true,
    actions,
    ...props,
  }, {username}) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="port_list"
        displayName={_('Port List')}
        userName={username}/>
      <TableData
        flex align="end">
        {entity.port_count.all}
      </TableData>
      <TableData
        flex align="end">
        {entity.port_count.tcp}
      </TableData>
      <TableData
        flex align="end">
        {entity.port_count.udp}
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: React.PropTypes.object,
  links: React.PropTypes.bool,
};

Row.contextTypes = {
  username: React.PropTypes.string.isRequired,
};

export default withEntityRow(Row, withEntityActions(IconActions));

// vim: set ts=2 sw=2 tw=80:
