/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
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
        entity={entity}
        name="schedule"
        onClick={onScheduleDeleteClick}
      />
      <EditIcon
        displayName={_('Schedule')}
        entity={entity}
        name="schedule"
        onClick={onScheduleEditClick}
      />
      <CloneIcon
        displayName={_('Schedule')}
        entity={entity}
        name="schedule"
        title={_('Clone Schedule')}
        value={entity}
        onClick={onScheduleCloneClick}
      />
      <ExportIcon
        title={_('Export Schedule')}
        value={entity}
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
        displayName={_('Schedule')}
        entity={entity}
        link={links}
        type="schedule"
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
