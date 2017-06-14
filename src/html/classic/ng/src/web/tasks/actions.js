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

import _ from '../../locale.js';
import {is_defined} from '../../utils.js';

import Layout from '../layout.js';
import PropTypes from '../proptypes.js';

import {withEntityActions} from '../entities/actions.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import Icon from '../icons/icon.js';
import ExportIcon from '../icons/exporticon.js';

import LegacyLink from '../link/legacylink.js';

const render_start_button = (task, capabilities, onStartTaskClick) => {
  if (task.isRunning() || task.isContainer()) {
    return null;
  }

  if (!capabilities.mayOp('start_task')) {
    return (
      <Icon
        size="small"
        img="start_inactive.svg"
        title={_('Permission to start Task denied')}/>
    );
  }

  if (!task.isActive()) {
    return (
      <Icon
        size="small"
        img="start.svg"
        title={_('Start')}
        value={task}
        onClick={onStartTaskClick}/>
    );
  }
  return (
    <Icon
      size="small"
      img="start_inactive.svg"
      title={_('Task is already active')}/>
  );
};

const render_schedule_icon = (task, links) => {
  let {schedule} = task;

  if (!is_defined(schedule) || !is_defined(schedule.id) ||
    schedule.id.length === 0) {
    return null;
  }

  if (is_defined(schedule.permissions) &&
    schedule.permissions.permission === 0) { // FIXME check if it must be '0'
    return (
      <Icon size="small" img="schedule_inactive.svg"
        title={_('Schedule Unavailable. Name: {{name}}, ID: {{id}}',
          {name: schedule.name, id: schedule.id})}/>
    );
  }
  let title;
  if (schedule.next_time === 'over') {
    title = _('View Details of Schedule {{name}} (Next due: over)',
      {name: schedule.name});
  }
  else if (task.schedule_periods === 1) {
    title = _('View Details of Schedule {{name}} (Next due: {{time}} Once)',
      {name: schedule.name, time: schedule.next_time});
  }
  else if (task.schedule_periods > 1) {
    title = _('View Details of Schedule {{name}} (Next due: ' +
      '{{next_time}}, {{periods}} more times )', {
        name: schedule.name,
        time: schedule.next_time,
        periods: task.schedule_periods,
      });
  }
  else {
    title = _('View Details of Schedule {{name}} (Next due: {{time}})',
      {name: schedule.name, time: schedule.next_time});
  }

  let icon = (
    <Icon size="small" img="scheduled.svg"
      alt={_('Schedule Details')}/>
  );

  if (links) {
    return (
      <LegacyLink
        cmd="get_schedule"
        schedule_id={schedule.id}
        title={title}
        className="icon icon-sm">
        {icon}
      </LegacyLink>
    );
  }
  return icon;
};

const  render_import_button = (task, capabilities, onImportReportClick) => {
  if (!task.isContainer() || !capabilities.mayCreate('report')) {
    return null;
  }

  return (
    <Icon
      value={task}
      img="upload.svg"
      onClick={onImportReportClick}
      alt={_('Import Report')}
      title={_('Import Report')}/>
  );
};

const render_resume_button = (task, capabilities, onResumeTaskClick) => {
  if (task.isContainer()) {
    return (
      <Icon
        img="resume_inactive.svg"
        alt={_('Resume')}
        title={_('Task is a container')}/>
    );
  }

  if (task.schedule.id && task.schedule.id.length > 0) {
    return (
      <Icon
        img="resume_inactive.svg"
        alt={_('Resume')}
        title={_('Task is scheduled')}/>
    );
  }

  if (task.isStopped()) {
    if (capabilities.mayOp('resume_task')) {
      return (
        <Icon
          title={_('Resume')}
          size="small"
          img="resume.svg"
          value={task}
          onClick={onResumeTaskClick}/>
      );
    }
    return (
      <Icon
        img="resume_inactive.svg"
        alt={_('Resume')}
        title={_('Permission to resume task denied')}/>
    );
  }

  return (
    <Icon
      img="resume_inactive.svg"
      alt={_('Resume')}
      title={_('Task is not stopped')}/>
  );
};

const Actions = ({
    entity,
    links,
    onEntityDelete,
    onEntityDownload,
    onEntityClone,
    onEditTaskClick,
    onImportReportClick,
    onResumeTaskClick,
    onStartTaskClick,
    onStopTaskClick,
  }, {capabilities}) => {
  return (
    <Layout flex align={['center', 'center']}>
      {
        render_schedule_icon(entity, links) ||
        render_start_button(entity, capabilities, onStartTaskClick) ||
        render_import_button(entity, capabilities, onImportReportClick)
      }

      {entity.isRunning() &&
        <Icon
          size="small"
          img="stop.svg"
          title={_('Stop')}
          value={entity}
          onClick={onStopTaskClick}/>
      }

      {render_resume_button(entity, capabilities, onResumeTaskClick)}

      <TrashIcon
        entity={entity}
        name="task"
        onClick={onEntityDelete}/>
      <EditIcon
        entity={entity}
        name="task"
        onClick={onEditTaskClick}/>
      <CloneIcon
        entity={entity}
        name="task"
        onClick={onEntityClone}/>
      <ExportIcon
        value={entity}
        title={_('Export Task')}
        onClick={onEntityDownload}
      />
    </Layout>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onEditTaskClick: PropTypes.func,
  onEntityClone: PropTypes.func,
  onEntityDelete: PropTypes.func,
  onEntityDownload: PropTypes.func,
  onImportReportClick: PropTypes.func,
  onResumeTaskClick: PropTypes.func,
  onStartTaskClick: PropTypes.func,
  onStopTaskClick: PropTypes.func,
};

Actions.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntityActions(Actions);

// vim: set ts=2 sw=2 tw=80:
