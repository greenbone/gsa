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
import {shorten} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';
import {render_component} from '../utils/render.js';

import {withEntityActions} from '../entities/actions.js';
import {withEntityRow} from '../entities/row.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../components/icon/exporticon.js';

import Layout from '../components/layout/layout.js';

import DetailsLink from '../components/link/detailslink.js';

import TableRow from '../components/table/row.js';
import TableData from '../components/table/data.js';


const Actions = ({
    entity,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEditNoteClick,
  }) => {
  return (
    <Layout flex align={['center', 'center']}>
      <TrashIcon
        entity={entity}
        name="note"
        onClick={onEntityDelete}/>
      <EditIcon
        entity={entity}
        name="note"
        onClick={onEditNoteClick}/>
      <CloneIcon
        entity={entity}
        name="note"
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Note')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onEditNoteClick: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
};

const Row = ({entity, links = true, actions, ...props}) => {
  let text = (
    <div>
      {entity.isOrphan() &&
        <div><b>{_('Orphan')}</b></div>
      }
      {shorten(entity.text)}
    </div>
  );
  return (
    <TableRow>
      <TableData>
        <DetailsLink
          legacy
          type="note"
          id={entity.id}
          textOnly={!links}>
          {text}
        </DetailsLink>
      </TableData>
      <TableData>
        {entity.nvt ? entity.nvt.name : ""}
      </TableData>
      <TableData title={entity.hosts}>
        {shorten(entity.hosts)}
      </TableData>
      <TableData title={entity.port}>
        {shorten(entity.port)}
      </TableData>
      <TableData>
        {entity.isActive() ? _('yes') : _('no')}
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
