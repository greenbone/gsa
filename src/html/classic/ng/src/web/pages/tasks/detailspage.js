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

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';

import EntityPage from '../../entity/page.js';
import {withEntityContainer} from '../../entity/container.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import ListIcon from '../../components/icon/listicon.js';

import ImportReportIcon from './icons/importreporticon.js';
import NewIconMenu from './icons/newiconmenu.js';
import ResumeIcon from './icons/resumeicon.js';
import ScheduleIcon from './icons/scheduleicon.js';
import StartIcon from './icons/starticon.js';
import StopIcon from './icons/stopicon.js';

const ToolBarIcons = ({
  entity,
  links,
  onEntityDelete,
  onEntityClone,
  onEntityDownload,
  onEntityEdit,
  onImportReportClick,
  onNewTaskClick,
  onNewContainerTaskClick,
  onStartTaskClick,
  onStopTaskClick,
  onResumeTaskClick,
}, {capabilities}) => {
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <HelpIcon
          page="task_details"
          title={_('Help: Task Details')}
        />
        <ListIcon
          title={_('Task List')}
          page="tasks"
        />
      </IconDivider>

      <IconDivider>
        <NewIconMenu
          onNewClick={onNewTaskClick}
          onNewContainerClick={onNewContainerTaskClick}
        />
        <CloneIcon
          entity={entity}
          name="task"
          onClick={onEntityClone}/>
        <EditIcon
          entity={entity}
          name="task"
          onClick={onEntityEdit}/>
        <TrashIcon
          entity={entity}
          name="task"
          onClick={onEntityDelete}/>
        <ExportIcon
          value={entity}
          title={_('Export Task as XML')}
          onClick={onEntityDownload}
        />
      </IconDivider>

      <IconDivider>
        <ScheduleIcon task={entity} links={links} />
        <StartIcon task={entity} onClick={onStartTaskClick}/>

        <ImportReportIcon task={entity} onClick={onImportReportClick}/>

        <StopIcon task={entity} onClick={onStopTaskClick}/>

        <ResumeIcon task={entity} onClick={onResumeTaskClick}/>
      </IconDivider>
    </Divider>
  );
};

const Details = () => {
  return (
    <div/>
  );
};

export default withEntityContainer('task', {
  sectionIcon: 'task.svg',
  title: _('Task'),
  toolBarIcons: ToolBarIcons,
  details: Details,
})(EntityPage);

// vim: set ts=2 sw=2 tw=80:
