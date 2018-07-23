/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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
import {shortDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import Promise from 'gmp/promise';

import {TARGET_CREDENTIAL_NAMES} from 'gmp/models/target';

import PropTypes from '../../utils/proptypes.js';
import {renderYesNo} from '../../utils/render.js';
import withComponentDefaults from '../../utils/withComponentDefaults.js';

import EntityPage from '../../entity/page.js';
import EntityPermissions from '../../entity/permissions.js';
import EntityContainer, {
  loader,
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Badge from '../../components/badge/badge.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import DetailsLink from '../../components/link/detailslink.js';
import Link from '../../components/link/link.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import InfoTable from '../../components/table/infotable.js';
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
import TaskComponent from './component.js';

const ToolBarIcons = ({
  entity,
  links,
  notes,
  overrides,
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

  const notes_count = isDefined(notes) ? notes.counts.length : undefined;
  const override_count = isDefined(overrides) ? overrides.counts.length :
    undefined;

  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="creating-a-task"
          title={_('Help: Tasks')}
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
          onClick={onTaskCloneClick}
        />
        <EditIcon
          entity={entity}
          name="task"
          onClick={onTaskEditClick}
        />
        <TrashIcon
          entity={entity}
          name="task"
          onClick={onTaskDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Task as XML')}
          onClick={onTaskDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {isDefined(entity.schedule) &&
          <ScheduleIcon
            schedule={entity.schedule}
            schedulePeriods={entity.schedule_periods}
            links={links}
          />
        }
        <StartIcon task={entity} onClick={onTaskStartClick}/>

        <ImportReportIcon task={entity} onClick={onReportImportClick}/>

        <StopIcon task={entity} onClick={onTaskStopClick}/>

        {!entity.isContainer() &&
          <ResumeIcon task={entity} onClick={onTaskResumeClick} />
        }
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {isDefined(entity.current_report) &&
            <DetailsLink
              type="report"
              id={entity.current_report.id}
              title={_('Current Report for Task {{name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(entity.current_report.scan_start),
              })}
            >
              <Icon
                img="report.svg"
              />
            </DetailsLink>
          }

          {isDefined(entity.last_report) &&
            <DetailsLink
              type="report"
              id={entity.last_report.id}
              title={_('Last Report for Task {{name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(entity.last_report.scan_start),
              })}
            >
              <Icon
                img="report.svg"
              />
            </DetailsLink>
          }

          <Badge
            content={entity.report_count.total}
          >
            <Link
              to="reports"
              filter={'task_id=' + entity.id}
              title={_('Total Reports for Task {{name}}', entity)}
            >
              <Icon
                img="report.svg"
              />
            </Link>
          </Badge>

          <Badge
            content={entity.report_count.finished}
          >
            <Link
              to="reports"
              filter={'task_id=' + entity.id + ' and status=Done'}
              title={_('Finished Reports for Task {{name}}', entity)}
            >
              <Icon
                img="report.svg"
              />
            </Link>
          </Badge>
        </IconDivider>

        <Badge
          content={entity.result_count}
        >
          <Link
            to="results"
            filter={'task_id=' + entity.id}
            title={_('Results for Task {{name}}', entity)}
          >
            <Icon
              img="result.svg"
            />
          </Link>
        </Badge>

        <IconDivider>
          <Badge
            content={notes_count}
          >
            <Link
              to="notes"
              filter={'task_id=' + entity.id}
              title={_('Notes for Task {{name}}', entity)}
            >
              <Icon
                img="note.svg"
              />
            </Link>
          </Badge>

          <Badge
            content={override_count}
          >
            <Link
              to="overrides"
              filter={'task_id=' + entity.id}
              title={_('Overrides for Task {{name}}', entity)}
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
  notes: PropTypes.object,
  overrides: PropTypes.object,
  onContainerTaskCreateClick: PropTypes.func.isRequired,
  onReportImportClick: PropTypes.func.isRequired,
  onTaskCloneClick: PropTypes.func.isRequired,
  onTaskCreateClick: PropTypes.func.isRequired,
  onTaskDeleteClick: PropTypes.func.isRequired,
  onTaskDownloadClick: PropTypes.func.isRequired,
  onTaskEditClick: PropTypes.func.isRequired,
  onTaskResumeClick: PropTypes.func.isRequired,
  onTaskStartClick: PropTypes.func.isRequired,
  onTaskStopClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  ...props
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
              {renderYesNo(entity.isAlterable())}
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

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <TaskComponent
    onCloned={goto_details('task', props)}
    onCloneError={onError}
    onCreated={goto_details('task', props)}
    onContainerCreated={goto_details('task', props)}
    onDeleted={goto_list('tasks', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
    onStarted={onChanged}
    onStartError={onError}
    onStopped={onChanged}
    onStopError={onError}
    onResumed={onChanged}
    onResumeError={onError}
    onContainerSaved={onChanged}
    onReportImported={onChanged}
  >
    {({
      clone,
      create,
      createcontainer,
      delete: delete_func,
      download,
      edit,
      start,
      stop,
      resume,
      reportimport,
    }) => (
      <EntityPage
        {...props}
        sectionIcon="task.svg"
        title={_('Task')}
        toolBarIcons={ToolBarIcons}
        detailsComponent={Details}
        permissionsComponent={TaskPermissions}
        onChanged={onChanged}
        onError={onError}
        onContainerTaskCreateClick={createcontainer}
        onReportImportClick={reportimport}
        onTaskCloneClick={clone}
        onTaskCreateClick={create}
        onTaskDeleteClick={delete_func}
        onTaskDownloadClick={download}
        onTaskEditClick={edit}
        onTaskResumeClick={resume}
        onTaskStartClick={start}
        onTaskStopClick={stop}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      >
        {({
          activeTab = 0,
          permissionsComponent,
          permissionsTitle,
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
        }) => {
          return (
            <Layout grow="1" flex="column">
              <TabLayout
                grow="1"
                align={['start', 'end']}
              >
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={onActivateTab}
                >
                  <Tab>
                    {_('Information')}
                  </Tab>
                  {isDefined(tagsComponent) &&
                    <Tab>
                      {tagsTitle}
                    </Tab>
                  }
                  {isDefined(permissionsComponent) &&
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  }
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Details
                      entity={entity}
                    />
                  </TabPanel>
                  {isDefined(tagsComponent) &&
                    <TabPanel>
                      {tagsComponent}
                    </TabPanel>
                  }
                  {isDefined(permissionsComponent) &&
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  }
                </TabPanels>
              </Tabs>
            </Layout>
          );
        }}
      </EntityPage>
    )}
  </TaskComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const TaskPermissions = withComponentDefaults({
  relatedResourcesLoaders: [
    ({entity, gmp}) => isDefined(entity.alerts) ?
      Promise.resolve([...entity.alerts]) : Promise.resolve([]),
    ({entity, gmp}) => {
      const resources = [];
      const names = ['config', 'scanner', 'schedule'];

      for (const name of names) {
        if (isDefined(entity[name])) {
          resources.push(entity[name]);
        }
      }
      return Promise.resolve(resources);
    },
    ({entity, gmp}) => {
      if (isDefined(entity.target)) {
        return gmp.target.get(entity.target).then(response => {
          const target = response.data;
          const resources = [target];

          for (const name of ['port_list', ...TARGET_CREDENTIAL_NAMES]) {
            const cred = target[name];
            if (isDefined(cred)) {
              resources.push(cred);
            }
          }
          return resources;
        });
      }
      return Promise.resolve([]);
    },
  ],
})(EntityPermissions);

const task_id_filter = id => 'task_id=' + id;

const TaskPage = props => (
  <EntityContainer
    {...props}
    name="task"
    loaders={[
      loader('notes', task_id_filter),
      loader('overrides', task_id_filter),
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default TaskPage;

// vim: set ts=2 sw=2 tw=80:
