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

import _, {long_date} from 'gmp/locale.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import EntityNameTableData from '../../entities/entitynametabledata.js';
import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import IconDivider from '../../components/layout/icondivider.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';
import {
  render_duration,
  render_next_time,
  render_period,
} from './render.js';

const Actions = ({
  entity,
  onScheduleDeleteClick,
  onScheduleDownloadClick,
  onScheduleCloneClick,
  onScheduleEditClick,
}) => (
  <IconDivider
    grow
    align={['center', 'center']}
  >
    <TrashIcon
      displayName={_('Schedule')}
      name="schedule"
      entity={entity}
      onClick={onScheduleDeleteClick}/>
    <EditIcon
      displayName={_('Schedule')}
      name="schedule"
      entity={entity}
      onClick={onScheduleEditClick}/>
    <CloneIcon
      displayName={_('Schedule')}
      name="schedule"
      entity={entity}
      title={_('Clone Schedule')}
      value={entity}
      onClick={onScheduleCloneClick}/>
    <ExportIcon
      value={entity}
      title={_('Export Schedule')}
      onClick={onScheduleDownloadClick}
    />
  </IconDivider>
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onScheduleCloneClick: PropTypes.func.isRequired,
  onScheduleDeleteClick: PropTypes.func.isRequired,
  onScheduleDownloadClick: PropTypes.func.isRequired,
  onScheduleEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="schedule"
        displayName={_('Schedule')}
        onToggleDetailsClick={onToggleDetailsClick}
      />
      <TableData>
        {long_date(entity.first_time)}
      </TableData>
      <TableData>
        {render_next_time(entity.next_time)}
      </TableData>
      <TableData>
        {render_period(entity)}
      </TableData>
      <TableData>
        {render_duration(entity.duration)}
      </TableData>
      {render_component(actions, {...props, entity})}
    </TableRow>
  );
};

Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default withEntityRow(withEntityActions(Actions))(Row);

// vim: set ts=2 sw=2 tw=80:
