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
import {is_defined, is_empty, shorten} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import Text from '../form/text.js';

import ExportIcon from '../icons/exporticon.js';

import LegacyLink from '../link/legacylink.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';

const IconActions = ({
    entity,
    onEditTarget,
    onEntityClone,
    onEntityDelete,
    onEntityDownload,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Target')}
        name="target"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Target')}
        name="target"
        entity={entity}
        onClick={onEditTarget}/>
      <CloneIcon
        displayName={_('Target')}
        name="target"
        entity={entity}
        title={_('Clone Target')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Target')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onEditTarget: PropTypes.func,
  onEntityClone: PropTypes.func,
};

const Cred = ({cred, title, links}) => {
  if (!is_defined(cred) || is_empty(cred.id)) {
    return null;
  }
  return (
    <Layout flex box>
      <Text>{title}: </Text>
      <Layout box>
        {links ?
          <LegacyLink cmd="get_credential" credential_id={cred.id}>
            {cred.name}
          </LegacyLink> :
          cred.name
        }
      </Layout>
    </Layout>
  );
};

Cred.propTypes = {
  cred: PropTypes.model,
  links: PropTypes.bool,
  title: PropTypes.string,
};


const Row = ({
  actions,
  entity,
  links = true,
  ...props
}, {capabilities, username}) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="target"
        displayName={_('Target')}
        userName={username}/>
      <TableData>
        {shorten(entity.hosts, 500)}
      </TableData>
      <TableData flex align="center">
        {entity.max_hosts}
      </TableData>
      <TableData>
        {links && capabilities.mayAccess('port_lists') ?
          <LegacyLink
            cmd="get_port_list"
            port_list_id={entity.port_list.id}>
            {entity.port_list.name}
          </LegacyLink> :
          entity.port_list.name
        }
      </TableData>
      <TableData flex="column" align="center">
        <Cred cred={entity.ssh_credential}
          title={'SSH'}
          links={links}/>
        <Cred cred={entity.smb_credential}
          title={'SMB'}
          links={links}/>
        <Cred cred={entity.esxi_credential}
          title={'ESXi'}
          links={links}/>
        <Cred cred={entity.snmp_credential}
          title={'SNMP'}
          links={links}/>
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
