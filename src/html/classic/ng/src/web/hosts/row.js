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
import {is_defined, is_empty} from '../../utils.js';

import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';
import SeverityBar from '../severitybar.js';
import {render_component} from '../render.js';

import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import ExportIcon from '../icons/exporticon.js';
import NewIcon from '../icons/newicon.js';
import OsIcon from '../icons/osicon.js';
import DeleteIcon from '../icons/deleteicon.js';
import EditIcon from '../icons/editicon.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';

const IconActions = ({entity, onEntityDelete, onEntityDownload,
    onCreateTarget, onEditHost}) => {
  return (
    <Layout flex align={['center', 'center']}>
      <DeleteIcon
        value={entity}
        title={_('Delete')}
        onClick={onEntityDelete}/>
      <EditIcon
        value={entity}
        title={_('Edit host')}
        onClick={onEditHost}/>
      <NewIcon
        value={entity}
        title={_('Create Target from Host')}
        onClick={onCreateTarget}/>
      <ExportIcon
        value={entity}
        title={_('Export Host')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

IconActions.propTypes = {
  entity: React.PropTypes.object,
  onEntityDelete: React.PropTypes.func,
  onEntityDownload: React.PropTypes.func,
  onCreateTarget: React.PropTypes.func,
  onEditHost: React.PropTypes.func,
};

const Actions = withEntityActions(IconActions);

const Row = ({entity, links = true, actions, ...props}) => {
  return (
    <TableRow>
      <TableData flex="column">
        {links ?
          <LegacyLink cmd="get_asset" asset_type="host">
            {entity.name}
          </LegacyLink> :
          entity.name
        }
        {!is_empty(entity.comment) &&
          <div className="comment">({entity.comment})</div>
        }
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
  entity: React.PropTypes.object,
  links: React.PropTypes.bool,
};

export default withEntityRow(Row, Actions);

// vim: set ts=2 sw=2 tw=80:
