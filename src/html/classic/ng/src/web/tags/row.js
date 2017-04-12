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

import _, {short_date} from '../../locale.js';
import {is_empty} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';
import {render_component, type_name, N_A} from '../render.js';

import EntityNameTableData from '../entities/entitynametabledata.js';
import EntityLink from '../entities/link.js';
import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../icons/exporticon.js';
import Icon from '../icons/icon.js';

import TableData from '../table/data.js';
import TableRow from '../table/row.js';


const Actions = ({
    entity,
    onEntityClone,
    onEntityDelete,
    onEntityDownload,
    onEntityEdit,
    onTagDisable,
    onTagEnable,
  }, {capabilities}) => {

  let endisableable = null;

  if (capabilities.mayEdit('tag')) {
    if (entity.isActive()) {
      endisableable = (
        <Icon
          img="disable.svg"
          value={entity}
          title={_('Disable Tag')}
          onClick={onTagDisable}
        />
      );
    }
    else {
      endisableable = (
        <Icon
          img="enable.svg"
          value={entity}
          title={_('Enable Tag')}
          onClick={onTagEnable}
        />
      );
    }
  }
  return (
    <Layout flex align={['center', 'center']}>
      {endisableable}
      <TrashIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Tag')}
        name="tag"
        entity={entity}
        title={_('Clone Tag')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Tag')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onEntityEdit: PropTypes.func,
  onTagDisable: PropTypes.func,
  onTagEnable: PropTypes.func,
};

Actions.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
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
        type="tag"
        displayName={_('Tag')}
        userName={username}/>
      <TableData>
        {entity.value}
      </TableData>
      <TableData>
        {entity.isActive() ? _('Yes') : _('No')}
      </TableData>
      <TableData>
        {type_name(entity.resource.type)}
      </TableData>
      <TableData>
        {entity.isOrphan() ?
          <span>{N_A}
            {!is_empty(entity.resource.id) &&
              <i> ({entity.resource.id})</i>
            }
          </span> :
            <EntityLink entity={entity.resource}/>
        }
      </TableData>
      <TableData>
        {short_date(entity.modified)}
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
