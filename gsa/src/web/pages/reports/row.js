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

import {TASK_STATUS, isActive} from 'gmp/models/task';

import SeverityBar from 'web/components/bar/severitybar';
import StatusBar from 'web/components/bar/statusbar';

import DateTime from 'web/components/date/datetime';

import DeleteIcon from 'web/components/icon/deleteicon';
import DeltaIcon from 'web/components/icon/deltaicon';
import DeltaSecondIcon from 'web/components/icon/deltasecondicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import withEntitiesActions from 'web/entities/withEntitiesActions';

import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({entity, selectedDeltaReport, onReportDeleteClick, onReportDeltaSelect}) => {
    const {report} = entity;
    const scanActive = isActive(report.scan_run_status);

    const title = scanActive ? _('Scan is active') : _('Delete Report');

    return (
      <IconDivider align={['center', 'center']} grow>
        {isDefined(selectedDeltaReport) ? (
          entity.id === selectedDeltaReport.id ? (
            <DeltaIcon
              active={false}
              title={_('Report is selected for delta comparison')}
            />
          ) : (
            <DeltaSecondIcon
              title={_('Select Report for delta comparison')}
              value={entity}
              onClick={onReportDeltaSelect}
            />
          )
        ) : (
          <DeltaIcon
            title={_('Select Report for delta comparison')}
            value={entity}
            onClick={onReportDeltaSelect}
          />
        )}
        <DeleteIcon
          active={!scanActive}
          value={entity}
          title={title}
          onClick={scanActive ? undefined : onReportDeleteClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  selectedDeltaReport: PropTypes.model,
  onReportDeleteClick: PropTypes.func.isRequired,
  onReportDeltaSelect: PropTypes.func.isRequired,
};

const Row = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  ...props
}) => {
  const {report} = entity;
  const {scan_run_status, task} = report;

  let status = scan_run_status;
  let progress;

  if (isDefined(task)) {
    if (task.isContainer()) {
      status =
        status === TASK_STATUS.running
          ? TASK_STATUS.uploading
          : TASK_STATUS.container;
    }
    progress = task.progress;
  }

  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink type="report" id={entity.id} textOnly={!links}>
            <DateTime date={report.timestamp} />
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <StatusBar status={status} progress={progress} />
      </TableData>
      <TableData>
        <span>
          <DetailsLink type="task" id={entity.task.id} textOnly={!links}>
            {entity.task.name}
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <SeverityBar severity={entity.report.severity.filtered} />
      </TableData>
      <TableData align="end">{report.result_count.hole.filtered}</TableData>
      <TableData align="end">{report.result_count.warning.filtered}</TableData>
      <TableData align="end">{report.result_count.info.filtered}</TableData>
      <TableData align="end">{report.result_count.log.filtered}</TableData>
      <TableData align="end">
        {report.result_count.false_positive.filtered}
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

Row.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default Row;

// vim: set ts=2 sw=2 tw=80:
