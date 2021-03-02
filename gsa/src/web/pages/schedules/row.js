/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import DateTime from 'web/components/date/datetime';

import ExportIcon from 'web/components/icon/exporticon';

import IconDivider from 'web/components/layout/icondivider';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityNameTableData from 'web/entities/entitynametabledata';
import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';

import {renderDuration, renderRecurrence} from './render';

const Actions = withEntitiesActions(
  ({
    entity,
    onScheduleDeleteClick,
    onScheduleDownloadClick,
    onScheduleCloneClick,
    onScheduleEditClick,
  }) => (
    <IconDivider grow align={['center', 'center']}>
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
  ),
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  onScheduleCloneClick: PropTypes.func.isRequired,
  onScheduleDeleteClick: PropTypes.func.isRequired,
  onScheduleDownloadClick: PropTypes.func.isRequired,
  onScheduleEditClick: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}) => {
  const {event = {}, timezone} = entity;
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
        {isDefined(startDate) ? (
          <DateTime date={startDate} timezone={timezone} />
        ) : (
          '-'
        )}
      </TableData>
      <TableData>
        {isDefined(nextDate) ? (
          <DateTime date={nextDate} timezone={timezone} />
        ) : (
          '-'
        )}
      </TableData>
      <TableData>{renderRecurrence(recurrence)}</TableData>
      <TableData>{renderDuration(duration)}</TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onToggleDetailsClick: PropTypes.func.isRequired,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
