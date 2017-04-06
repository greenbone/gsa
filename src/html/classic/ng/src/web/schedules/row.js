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

import _, {long_date, interval} from '../../locale.js';

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
        displayName={_('Schedule')}
        name="schedule"
        entity={entity}
        onClick={onEntityDelete}/>
      <EditIcon
        displayName={_('Schedule')}
        name="schedule"
        entity={entity}
        onClick={onEntityEdit}/>
      <CloneIcon
        displayName={_('Schedule')}
        name="schedule"
        entity={entity}
        title={_('Clone Schedule')}
        value={entity}
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Schedule')}
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
  onTestSchedule: React.PropTypes.func,
};

const render_period = entity => {
  if (entity.period === 0 && entity.period_months === 0) {
    return _('Once');
  }
  if (entity.period === 0 && entity.period_months === 1) {
    return _('One month');
  }
  if (entity.period === 0) {
    return _('{{number}} months', {number: entity.period_months});
  }
  return interval(entity.period);
};

const render_duration = entity => {
  if (entity.duration === 0) {
    return _('Entire Operation');
  }
  return interval(entity.duration);
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
  let next_time = entity.next_time === 'over' ? '-' :
    long_date(entity.next_time);
  return (
    <TableRow>
      <EntityNameTableData
        entity={entity}
        link={links}
        type="schedule"
        displayName={_('Schedule')}
        userName={username}/>
      <TableData>
        {long_date(entity.first_time)}
      </TableData>
      <TableData>
        {next_time}
      </TableData>
      <TableData>
        {render_period(entity)}
      </TableData>
      <TableData>
        {render_duration(entity)}
      </TableData>
      {render_component(actions, {...props, entity})}
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

export default withEntityRow(Row, withEntityActions(Actions));

// vim: set ts=2 sw=2 tw=80:
