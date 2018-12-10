/* Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import {TASK_STATUS, isActive} from 'gmp/models/task';

import PropTypes from 'web/utils/proptypes';
import {renderComponent} from 'web/utils/render';

import {withEntityActions} from 'web/entities/actions';
import {withEntityRow} from 'web/entities/row';

import SeverityBar from 'web/components/bar/severitybar';
import StatusBar from 'web/components/bar/statusbar';

import DeleteIcon from 'web/components/icon/deleteicon';
import DeltaIcon from 'web/components/icon/deltaicon';
import DeltaSecondIcon from 'web/components/icon/deltasecondicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

const IconActions = ({
  entity,
  selectedDeltaReport,
  onReportDeleteClick,
  onReportDeltaSelect,
}) => {
  const {report} = entity;
  const scanActive = isActive(report.scan_run_status);

  const title = scanActive ? _('Scan is active') : _('Delete Report');

  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
      {isDefined(selectedDeltaReport) ?
        entity.id === selectedDeltaReport.id ?
          <DeltaIcon
            active={false}
            title={_('Report is selected for delta comparision')}
          /> :
          <DeltaSecondIcon
            title={_('Select Report for delta comparision')}
            value={entity}
            onClick={onReportDeltaSelect}
          /> :
          <DeltaIcon
            title={_('Select Report for delta comparision')}
            value={entity}
            onClick={onReportDeltaSelect}
          />
      }
      <DeleteIcon
        active={!scanActive}
        value={entity}
        title={title}
        onClick={scanActive ? undefined : onReportDeleteClick}
      />
    </IconDivider>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model.isRequired,
  selectedDeltaReport: PropTypes.model,
  onReportDeleteClick: PropTypes.func.isRequired,
  onReportDeltaSelect: PropTypes.func.isRequired,
};

const Row = ({entity, links = true, actions, ...other}) => {
  const {report} = entity;
  const {scan_run_status, task} = report;

  let status = scan_run_status;
  let progress;

  if (isDefined(task)) {
    if (task.isContainer()) {
      status = status === TASK_STATUS.running ?
        TASK_STATUS.uploading :
        TASK_STATUS.container;
    }
    progress = task.progress;
  }

  return (
    <TableRow>
      <TableData>
        <DetailsLink
          type="report"
          id={entity.id}
          textOnly={!links}
        >
          {longDate(report.timestamp)}
        </DetailsLink>
      </TableData>
      <TableData>
        <StatusBar
          status={status}
          progress={progress}
        />
      </TableData>
      <TableData>
        <DetailsLink
          type="task"
          id={entity.task.id}
          textOnly={!links}
        >
          {entity.task.name}
        </DetailsLink>
      </TableData>
      <TableData>
        <SeverityBar severity={entity.report.severity.filtered}/>
      </TableData>
      <TableData align="end">
        {report.result_count.hole.filtered}
      </TableData>
      <TableData align="end">
        {report.result_count.warning.filtered}
      </TableData>
      <TableData align="end">
        {report.result_count.info.filtered}
      </TableData>
      <TableData align="end">
        {report.result_count.log.filtered}
      </TableData>
      <TableData align="end">
        {report.result_count.false_positive.filtered}
      </TableData>
      {renderComponent(actions, {...other, entity})}
    </TableRow>
  );
};


Row.propTypes = {
  actions: PropTypes.componentOrFalse,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default withEntityRow(withEntityActions(IconActions))(Row);

// vim: set ts=2 sw=2 tw=80:
