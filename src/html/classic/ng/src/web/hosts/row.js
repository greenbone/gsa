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

import _, {datetime} from '../../locale.js';
import {is_defined} from '../../utils.js';

import Comment from '../comment.js';
import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import {render_component} from '../render.js';

import EditIcon from '../entities/icons/entityediticon.js';
import DeleteIcon from '../entities/icons/entitydeleteicon.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import ExportIcon from '../icons/exporticon.js';
import NewIcon from '../icons/newicon.js';
import OsIcon from '../icons/osicon.js';

import LegacyLink from '../link/legacylink.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';

const Actions = ({
    entity,
    onCreateTarget,
    onEditHost,
    onEntityDelete,
    onEntityDownload,
  }, {capabilities}) => {

  let new_title;
  let can_create_target = capabilities.mayCreate('target');
  if (can_create_target) {
    new_title = _('Create Target from Host');
  }
  else {
    new_title = _('Permission to create Target denied');
  }
  return (
    <Layout flex align={['center', 'center']}>
      <DeleteIcon
        entity={entity}
        name="asset"
        displayName={_('Host')}
        onClick={onEntityDelete}/>
      <EditIcon
        entity={entity}
        name="asset"
        displayName={_('Host')}
        onClick={onEditHost}/>
      <NewIcon
        value={entity}
        active={can_create_target}
        title={new_title}
        onClick={onCreateTarget}/>
      <ExportIcon
        value={entity}
        title={_('Export Host')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onCreateTarget: PropTypes.func,
  onEditHost: PropTypes.func,
};

Actions.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

const Row = ({entity, links = true, actions, ...props}) => {
  return (
    <TableRow>
      <TableData flex="column">
        {links ?
          <LegacyLink
            cmd="get_asset"
            asset_type="host"
            asset_id={entity.id}>
            {entity.name}
          </LegacyLink> :
          entity.name
        }
        <Comment text={entity.comment}/>
      </TableData>
      <TableData>
        {entity.hostname}
      </TableData>
      <TableData>
        {entity.ip}
      </TableData>
      <TableData flex align="center">
        <OsIcon host={entity}/>
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.severity}/>
      </TableData>
      <TableData>
        {is_defined(entity.modification_time) &&
          datetime(entity.modification_time)
        }
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model,
  links: PropTypes.bool,
};

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
