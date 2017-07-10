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

import _, {short_date} from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import {render_yesno} from '../../utils/render.js';

import EntityPage from '../../entity/page.js';
import {withEntityContainer} from '../../entity/container.js';

import CloneIcon from '../../entities/icons/entitycloneicon.js';
import EditIcon from '../../entities/icons/entityediticon.js';
import TrashIcon from '../../entities/icons/entitytrashicon.js';

import Badge from '../../components/badge/badge.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import ExportIcon from '../../components/icon/exporticon.js';
import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import InfoTable from '../../components/table/info.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableRow from '../../components/table/row.js';

import ImportReportIcon from './icons/importreporticon.js';
import NewIconMenu from './icons/newiconmenu.js';
import ResumeIcon from './icons/resumeicon.js';
import ScheduleIcon from './icons/scheduleicon.js';
import StartIcon from './icons/starticon.js';
import StopIcon from './icons/stopicon.js';

import TaskDetails from './details.js';
import TaskStatus from './status.js';
import withTaskComponent from './withTaskComponent.js';

const ToolBarIcons = ({
  entity,
  links,
  onTaskDeleteClick,
  onTaskCloneClick,
  onTaskDownloadClick,
  onTaskEditClick,
  onReportImportClick,
  onTaskCreateClick,
  onContainerTaskCreateClick,
  onTaskStartClick,
  onTaskStopClick,
  onTaskResumeClick,
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
        {entity.isAlterable() && !entity.isNew() &&
          <Icon
            img="alterable.svg"
            title={_('This is an Alterable Task. Reports may not relate to ' +
              'current Scan Config or Target!')}
          />
        }
      </IconDivider>

      <IconDivider>
        <NewIconMenu
          onNewClick={onTaskCreateClick}
          onNewContainerClick={onContainerTaskCreateClick}
        />
        <CloneIcon
          entity={entity}
          name="task"
          onClick={onTaskCloneClick}/>
        <EditIcon
          entity={entity}
          name="task"
          onClick={onTaskEditClick}/>
        <TrashIcon
          entity={entity}
          name="task"
          onClick={onTaskDeleteClick}/>
        <ExportIcon
          value={entity}
          title={_('Export Task as XML')}
          onClick={onTaskDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        <ScheduleIcon task={entity} links={links} />
        <StartIcon task={entity} onClick={onTaskStartClick}/>

        <ImportReportIcon task={entity} onClick={onReportImportClick}/>

        <StopIcon task={entity} onClick={onTaskStopClick}/>

        <ResumeIcon task={entity} onClick={onTaskResumeClick}/>
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {is_defined(entity.current_report) &&
            <DetailsLink
              legacy
              type="report"
              id={entity.current_report.id}
              title={_('Current Report on Task {{name}} from {{- date}}', {
                name: entity.name,
                date: short_date(entity.current_report.scan_start),
              })}
            >
              <Icon
                img="report.svg"
              />
            </DetailsLink>
          }

          <Badge
            content={entity.report_count.total}>
            <Link
              to="reports"
              filter={'task_id=' + entity.id}
              title={_('Total Reports on Task {{name}}', entity)}
            >
              <Icon
                img="report.svg"
              />
            </Link>
          </Badge>

          <Badge
            content={entity.report_count.finished}>
            <Link
              to="reports"
              filter={'task_id=' + entity.id + ' and status=Done'}
              title={_('Finished Reports on Task {{name}}', entity)}
            >
              <Icon
                img="report.svg"
              />
            </Link>
          </Badge>
        </IconDivider>

        <Badge
          content={entity.result_count}>
          <Link
            to="results"
            filter={'task_id=' + entity.id}
            title={_('Results on Task {{name}}', entity)}
          >
            <Icon
              img="result.svg"
            />
          </Link>
        </Badge>

        <IconDivider>
          <Badge
            content="0">
            <Link
              to="notes"
              filter={'task_id=' + entity.id}
              title={_('Notes on Task {{name}}', entity)}
            >
              <Icon
                img="note.svg"
              />
            </Link>
          </Badge>

          <Badge
            content="0">
            <Link
              to="overrides"
              filter={'task_id=' + entity.id}
              title={_('Overrides on Task {{name}}', entity)}
            >
              <Icon
                img="override.svg"
              />
            </Link>
          </Badge>
        </IconDivider>
      </Divider>

    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  onTaskDeleteClick: PropTypes.func.isRequired,
  onTaskCloneClick: PropTypes.func.isRequired,
  onTaskDownloadClick: PropTypes.func.isRequired,
  onTaskEditClick: PropTypes.func.isRequired,
  onReportImportClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onTaskStartClick: PropTypes.func.isRequired,
  onTaskStopClick: PropTypes.func.isRequired,
  onTaskResumeClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  ...props,
}) => {
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>
              {_('Name')}
            </TableData>
            <TableData>
              {entity.name}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Comment')}
            </TableData>
            <TableData>
              {entity.comment}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Alterable')}
            </TableData>
            <TableData>
              {render_yesno(entity.isAlterable())}
            </TableData>
          </TableRow>

          <TableRow>
            <TableData>
              {_('Status')}
            </TableData>
            <TableData>
              <TaskStatus
                task={entity}
              />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <TaskDetails
        entity={entity}
        {...props}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const goto_task = ({router}, {data}) => router.push('ng/task/' + data.id);

const Page = withTaskComponent({
  onCloned: goto_task,
  onDeleted: ({router}) => {
    router.push('/ng/tasks/');
  },
  onCreated: goto_task,
  onSaved: 'onChanged',
  onStarted: 'onChanged',
  onStopped: 'onChanged',
  onResumed: 'onChanged',
  onReportImported: 'onChanged',
  onContainerCreated: goto_task,
  onContainerSaved: 'onChanged',
})(EntityPage);

export default withEntityContainer('task', {
  sectionIcon: 'task.svg',
  title: _('Task'),
  toolBarIcons: ToolBarIcons,
  details: Details,
})(Page);

// vim: set ts=2 sw=2 tw=80:
