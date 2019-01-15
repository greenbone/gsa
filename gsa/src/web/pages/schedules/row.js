/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';
import {dateTimeWithTimeZone} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';

import {
  renderDuration,
  renderRecurrence,
} from './render';
import withEntitiesActions from 'web/entities/withEntitiesActions';

const Actions = withEntitiesActions(({
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
      onClick={onScheduleDeleteClick}
    />
    <EditIcon
      displayName={_('Schedule')}
      name="schedule"
      entity={entity}
      onClick={onScheduleEditClick}
    />
    <CloneIcon
      displayName={_('Schedule')}
      name="schedule"
      entity={entity}
      title={_('Clone Schedule')}
      value={entity}
      onClick={onScheduleCloneClick}
    />
    <ExportIcon
      value={entity}
      title={_('Export Schedule')}
      onClick={onScheduleDownloadClick}
    />
  </IconDivider>
));

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onScheduleCloneClick: PropTypes.func.isRequired,
  onScheduleDeleteClick: PropTypes.func.isRequired,
  onScheduleDownloadClick: PropTypes.func.isRequired,
  onScheduleEditClick: PropTypes.func.isRequired,
};

const Row = ({
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const {event} = entity;
  const {startDate, nextDate, duration, recurrence} = event;
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
        {dateTimeWithTimeZone(startDate)}
      </TableData>
      <TableData>
        {isDefined(nextDate) ? dateTimeWithTimeZone(nextDate) : '-'}
      </TableData>
      <TableData>
        {renderRecurrence(recurrence)}
      </TableData>
      <TableData>
        {renderDuration(duration)}
      </TableData>
      <Actions
        {...props}
        entity={entity}
      />
    </TableRow>
  );
};

Row.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
