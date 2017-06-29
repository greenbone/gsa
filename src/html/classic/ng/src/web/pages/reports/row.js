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

import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';

import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

const IconActions = ({entity, onEntityDelete}) => {
  let {report} = entity;
  let active = report.scan_run_status !== 'Running' &&
    report.scan_run_status !== 'Requested' &&
    report.scan_run_status !== 'Stop Requested' &&
    report.scan_run_status !== 'Resume Requested';

  let title;
  if (active) {
    title = _('Delete Report');
  }
  else {
    title = _('Scan is active');
  }
  return (
    <Layout flex align={['center', 'center']}>
      <DeleteIcon
        active={active}
        value={entity}
        title={title}
        onClick={onEntityDelete}/>
    </Layout>
  );
};

IconActions.propTypes = {
  entity: PropTypes.model.isRequired,
  onEntityDelete: PropTypes.func,
};

const Row = ({entity, links = true, actions, ...other}) => {
  let {report} = entity;

  let status = report.scan_run_status;
  let progress;

  if (is_defined(report.task)) {
    if (is_defined(report.task.target) && report.task.target.id === '' &&
        report.scan_run_status === 'Running') {
      status = 'Uploading';
    }
    else if (is_defined(report.task.target) && report.task.target.id === '') {
      status = 'Container';
    }
    progress = report.task.progress;
  }

  return (
    <TableRow>
      <TableData>
        <DetailsLink
          legacy
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
          legacy
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

export default withEntityRow(Row, withEntityActions(IconActions));

// vim: set ts=2 sw=2 tw=80:

