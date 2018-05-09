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
import {shorten} from 'gmp/utils';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow, RowDetailsToggle} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import IconDivider from '../../components/layout/icondivider.js';

import TableRow from '../../components/table/row.js';
import TableData from '../../components/table/data.js';


const Actions = ({
    entity,
    onNoteDeleteClick,
    onNoteDownloadClick,
    onNoteCloneClick,
    onNoteEditClick,
  }) => {
  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
      <TrashIcon
        entity={entity}
        name="note"
        onClick={onNoteDeleteClick}/>
      <EditIcon
        entity={entity}
        name="note"
        onClick={onNoteEditClick}/>
      <CloneIcon
        entity={entity}
        name="note"
        onClick={onNoteCloneClick}/>
      <ExportIcon
        value={entity}
        title={_('Export Note')}
        onClick={onNoteDownloadClick}
      />
    </IconDivider>
  );
};

Actions.propTypes = {
  entity: PropTypes.model,
  onNoteCloneClick: PropTypes.func.isRequired,
  onNoteDeleteClick: PropTypes.func.isRequired,
  onNoteDownloadClick: PropTypes.func.isRequired,
  onNoteEditClick: PropTypes.func.isRequired,
};

const Row = ({
  entity,
  links = true,
  actions,
  onToggleDetailsClick,
  ...props,
}) => {
  const text = (
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
        <RowDetailsToggle
          name={entity.id}
          onClick={onToggleDetailsClick}>
          {text}
        </RowDetailsToggle>
      </TableData>
      <TableData>
        {entity.nvt ? entity.nvt.name : ""}
      </TableData>
      <TableData title={entity.hosts}>
        {shorten(entity.hosts.join(', '))}
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
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
