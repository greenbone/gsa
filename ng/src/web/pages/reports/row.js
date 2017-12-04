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

import _, {datetime} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_component} from '../../utils/render.js';

import {withEntityActions} from '../../entities/actions.js';
import {withEntityRow} from '../../entities/row.js';

import SeverityBar from '../../components/bar/severitybar.js';
import StatusBar from '../../components/bar/statusbar.js';

import DeleteIcon from '../../components/icon/deleteicon.js';
import Icon from '../../components/icon/icon.js';

import IconDivider from '../../components/layout/icondivider.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const IconActions = ({
  entity,
  selectedDeltaReport,
  onReportDeleteClick,
  onReportDeltaSelect,
}) => {
  const {report} = entity;
  const active = report.scan_run_status !== 'Running' &&
    report.scan_run_status !== 'Requested' &&
    report.scan_run_status !== 'Stop Requested' &&
    report.scan_run_status !== 'Resume Requested';

  const title = active ? _('Delete Report') : _('Scan is active');

  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >
      {is_defined(selectedDeltaReport) ?
        entity.id === selectedDeltaReport.id ?
          <Icon
            img="delta_inactive.svg"
            title={_('Report is selected for delta comparision')}
          /> :
          <Icon
            img="delta_second.svg"
            title={_('Select Report for delta comparision')}
            value={entity}
            onClick={onReportDeltaSelect}
          /> :
          <Icon
            img="delta.svg"
            title={_('Select Report for delta comparision')}
            value={entity}
            onClick={onReportDeltaSelect}
          />
      }
      <DeleteIcon
        active={active}
        value={entity}
        title={title}
        onClick={active ? onReportDeleteClick : undefined}
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

  if (is_defined(task)) {
    if (task.isContainer()) {
      status = status === 'Running' ? 'Uploading' : 'Container';
    }
    progress = task.progress;
  }

  return (
    <TableRow>
      <TableData>
        <DetailsLink
          type="report"
          id={entity.id}
          textOnly={!links}>
          {datetime(report.timestamp)}
        </DetailsLink>
      </TableData>
      <TableData>
        <StatusBar
          status={status}
          progress={progress}/>
      </TableData>
      <TableData>
        <DetailsLink
          type="task"
          id={entity.task.id}
          textOnly={!links}>
          {entity.task.name}
        </DetailsLink>
      </TableData>
      <TableData flex align="center">
        <SeverityBar severity={entity.report.severity.filtered}/>
      </TableData>
      <TableData flex align="end">
        {report.result_count.hole.filtered}
      </TableData>
      <TableData flex align="end">
        {report.result_count.warning.filtered}
      </TableData>
      <TableData flex align="end">
        {report.result_count.info.filtered}
      </TableData>
      <TableData flex align="end">
        {report.result_count.log.filtered}
      </TableData>
      <TableData flex align="end">
        {report.result_count.false_positive.filtered}
      </TableData>
      {render_component(actions, {...other, entity})}
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
