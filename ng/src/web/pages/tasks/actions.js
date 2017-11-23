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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import IconDivider from '../../components/layout/icondivider.js';

import {withEntityActions} from '../../entities/actions.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';

import ImportReportIcon from './icons/importreporticon.js';
import ResumeIcon from './icons/resumeicon.js';
import ScheduleIcon from './icons/scheduleicon.js';
import StartIcon from './icons/starticon.js';
import StopIcon from './icons/stopicon.js';

const Actions = ({
    entity,
    links,
    onReportImportClick,
    onTaskCloneClick,
    onTaskDeleteClick,
    onTaskDownloadClick,
    onTaskEditClick,
    onTaskResumeClick,
    onTaskStartClick,
    onTaskStopClick,
  }, {capabilities}) => {
  return (
    <IconDivider
      align={['center', 'center']}
      grow
    >

      {is_defined(entity.schedule) ?
        <ScheduleIcon task={entity} links={links} /> :
        <StartIcon task={entity} onClick={onTaskStartClick}/>
      }

      <ImportReportIcon task={entity} onClick={onReportImportClick}/>

      <StopIcon task={entity} onClick={onTaskStopClick}/>

      <ResumeIcon task={entity} onClick={onTaskResumeClick}/>

      <TrashIcon
        entity={entity}
        name="task"
        onClick={onTaskDeleteClick}/>
      <EditIcon
        entity={entity}
        name="task"
        onClick={onTaskEditClick}/>
      <CloneIcon
        entity={entity}
        name="task"
        onClick={onTaskCloneClick}/>
      <ExportIcon
        value={entity}
        title={_('Export Task')}
        onClick={onTaskDownloadClick}
      />
    </IconDivider>
  );
};

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onReportImportClick: PropTypes.func.isRequired,
  onTaskCloneClick: PropTypes.func.isRequired,
  onTaskDeleteClick: PropTypes.func.isRequired,
  onTaskDownloadClick: PropTypes.func.isRequired,
  onTaskEditClick: PropTypes.func.isRequired,
  onTaskResumeClick: PropTypes.func.isRequired,
  onTaskStartClick: PropTypes.func.isRequired,
  onTaskStopClick: PropTypes.func.isRequired,
};

Actions.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default withEntityActions(Actions);

// vim: set ts=2 sw=2 tw=80:
