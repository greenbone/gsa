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

import Comment from '../comment.js';
import Layout from '../layout.js';
import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';
import {render_component} from '../render.js';

import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import ObserverIcon from '../entities/icons/entityobservericon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../icons/exporticon.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';

const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEntityEdit,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Filter')}
        name="filter"
        entity={entity}
        title={_('Clone Filter')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Filter')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEntityEdit: React.PropTypes.func,
  onEntityClone: React.PropTypes.func,
  onEntityDelete: React.PropTypes.func,
  onEntityDownload: React.PropTypes.func,
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
      <TableData flex="column">
        <Layout flex align="space-between">
          {links ?
            <LegacyLink
              cmd="get_filter"
              filter_id={entity.id}>
              {entity.name}
            </LegacyLink> :
            entity.name
          }
          <ObserverIcon
            displayName={_('Filter')}
            entity={entity}
            userName={username}
          />
        </Layout>
        {entity.comment &&
          <Comment>({entity.comment})</Comment>
        }
      </TableData>
      <TableData>
        {entity.term}
      </TableData>
      <TableData>
        {entity.type}
      </TableData>
      <TableData>
        {render_component(actions, {...props, entity})}
      </TableData>
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: React.PropTypes.bool,
};

Row.contextTypes = {
  capabilities: React.PropTypes.object.isRequired,
  username: React.PropTypes.string.isRequired,
};

export default withEntityRow(Row, Actions);

// vim: set ts=2 sw=2 tw=80:
