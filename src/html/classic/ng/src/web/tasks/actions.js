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

import PropTypes from '../proptypes.js';

import IconDivider from '../divider/icondivider.js';

import {withEntityActions} from '../entities/actions.js';

import CloneIcon from '../entities/icons/entitycloneicon.js';
import EditIcon from '../entities/icons/entityediticon.js';
import TrashIcon from '../entities/icons/entitytrashicon.js';

import ExportIcon from '../icons/exporticon.js';

import ImportReportIcon from './icons/importreporticon.js';
import ResumeIcon from './icons/resumeicon.js';
import ScheduleIcon from './icons/scheduleicon.js';
import StartIcon from './icons/starticon.js';
import StopIcon from './icons/stopicon.js';

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
    <IconDivider flex align={['center', 'center']}>

      {is_defined(entity.schedule) ?
        <ScheduleIcon task={entity} links={links} /> :
        <StartIcon task={entity} onClick={onStartTaskClick}/>
      }

      <ImportReportIcon task={entity} onClick={onImportReportClick}/>

      <StopIcon task={entity} onClick={onStopTaskClick}/>

      <ResumeIcon task={entity} onClick={onResumeTaskClick}/>

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
    </IconDivider>
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
