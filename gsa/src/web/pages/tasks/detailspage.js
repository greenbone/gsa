/* Copyright (C) 2017-2019 Greenbone Networks GmbH
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
import {shortDate} from 'gmp/locale/date';

import Filter from 'gmp/models/filter';

import {isDefined} from 'gmp/utils/identity';

import {TARGET_CREDENTIAL_NAMES} from 'gmp/models/target';

import Badge from 'web/components/badge/badge';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import DetailsLink from 'web/components/link/detailslink';
import Link from 'web/components/link/link';

import AlterableIcon from 'web/components/icon/alterableicon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import NoteIcon from 'web/components/icon/noteicon';
import OverrideIcon from 'web/components/icon/overrideicon';
import ReportIcon from 'web/components/icon/reporticon';
import ResultIcon from 'web/components/icon/resulticon';
import TaskIcon from 'web/components/icon/taskicon';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import EntityPage, {Col} from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {
  selector as notesSelector,
  loadEntities as loadNotes,
} from 'web/store/entities/notes';
import {
  selector as overridesSelector,
  loadEntities as loadOverrides,
} from 'web/store/entities/overrides';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {
  selector as taskSelector,
  loadEntity as loadTask,
} from 'web/store/entities/tasks';

import {DEFAULT_RELOAD_INTERVAL_ACTIVE} from 'web/utils/constants';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withComponentDefaults from 'web/utils/withComponentDefaults';

import ImportReportIcon from './icons/importreporticon';
import NewIconMenu from './icons/newiconmenu';
import ResumeIcon from './icons/resumeicon';
import ScheduleIcon from './icons/scheduleicon';
import StartIcon from './icons/starticon';
import StopIcon from './icons/stopicon';

import TaskDetails from './details';
import TaskStatus from './status';
import TaskComponent from './component';

const ToolBarIcons = ({
  entity,
  links,
  notes = [],
  overrides = [],
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
}) => {
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="creating-a-task"
          title={_('Help: Tasks')}
        />
        <ListIcon title={_('Task List')} page="tasks" />
        {entity.isAlterable() && !entity.isNew() && (
          <AlterableIcon
            title={_(
              'This is an Alterable Task. Reports may not relate to ' +
                'current Scan Config or Target!',
            )}
          />
        )}
      </IconDivider>

      <IconDivider>
        <NewIconMenu
          onNewClick={onTaskCreateClick}
          onNewContainerClick={onContainerTaskCreateClick}
        />
        <CloneIcon entity={entity} name="task" onClick={onTaskCloneClick} />
        <EditIcon entity={entity} name="task" onClick={onTaskEditClick} />
        <TrashIcon entity={entity} name="task" onClick={onTaskDeleteClick} />
        <ExportIcon
          value={entity}
          title={_('Export Task as XML')}
          onClick={onTaskDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {isDefined(entity.schedule) && (
          <ScheduleIcon
            schedule={entity.schedule}
            schedulePeriods={entity.schedule_periods}
            links={links}
          />
        )}
        <StartIcon task={entity} onClick={onTaskStartClick} />

        <ImportReportIcon task={entity} onClick={onReportImportClick} />

        <StopIcon task={entity} onClick={onTaskStopClick} />

        {!entity.isContainer() && (
          <ResumeIcon task={entity} onClick={onTaskResumeClick} />
        )}
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {isDefined(entity.current_report) && (
            <DetailsLink
              type="report"
              id={entity.current_report.id}
              title={_('Current Report for Task {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(entity.current_report.scan_start),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          {!isDefined(entity.current_report) && isDefined(entity.last_report) && (
            <DetailsLink
              type="report"
              id={entity.last_report.id}
              title={_('Last Report for Task {{- name}} from {{- date}}', {
                name: entity.name,
                date: shortDate(entity.last_report.scan_start),
              })}
            >
              <ReportIcon />
            </DetailsLink>
          )}

          <Link
            to="reports"
            filter={'task_id=' + entity.id}
            title={_('Total Reports for Task {{- name}}', entity)}
          >
            <Badge content={entity.report_count.total}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          to="results"
          filter={'task_id=' + entity.id}
          title={_('Results for Task {{- name}}', entity)}
        >
          <Badge content={entity.result_count}>
            <ResultIcon />
          </Badge>
        </Link>

        <IconDivider>
          <Link
            to="notes"
            filter={'task_id=' + entity.id}
            title={_('Notes for Task {{- name}}', entity)}
          >
            <Badge content={notes.length}>
              <NoteIcon />
            </Badge>
          </Link>

          <Link
            to="overrides"
            filter={'task_id=' + entity.id}
            title={_('Overrides for Task {{- name}}', entity)}
          >
            <Badge content={overrides.length}>
              <OverrideIcon />
            </Badge>
          </Link>
        </IconDivider>
      </Divider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
  notes: PropTypes.array,
  overrides: PropTypes.array,
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

const Details = ({entity, ...props}) => {
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <Col width="10%" />
          <Col width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Name')}</TableData>
            <TableData>{entity.name}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{entity.comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Alterable')}</TableData>
            <TableData>{renderYesNo(entity.isAlterable())}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Status')}</TableData>
            <TableData>
              <TaskStatus task={entity} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <TaskDetails entity={entity} {...props} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <TaskComponent
    onCloned={goto_details('task', props)}
    onCloneError={onError}
    onCreated={goto_details('task', props)}
    onContainerCreated={goto_details('task', props)}
    onContainerSaved={onChanged}
    onDeleted={goto_list('tasks', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
    onReportImported={onChanged}
    onResumed={onChanged}
    onResumeError={onError}
    onSaved={onChanged}
    onStarted={onChanged}
    onStartError={onError}
    onStopped={onChanged}
    onStopError={onError}
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
        entity={entity}
        sectionIcon={<TaskIcon size="large" />}
        title={_('Task')}
        toolBarIcons={ToolBarIcons}
        onChanged={onChanged}
        onContainerTaskCreateClick={createcontainer}
        onError={onError}
        onInteraction={onInteraction}
        onReportImportClick={reportimport}
        onTaskCloneClick={clone}
        onTaskCreateClick={create}
        onTaskDeleteClick={delete_func}
        onTaskDownloadClick={download}
        onTaskEditClick={edit}
        onTaskResumeClick={resume}
        onTaskStartClick={start}
        onTaskStopClick={stop}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <Layout grow="1" flex="column">
              <TabLayout grow="1" align={['start', 'end']}>
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={onActivateTab}
                >
                  <Tab>{_('Information')}</Tab>
                  <EntitiesTab entities={entity.userTags}>
                    {_('User Tags')}
                  </EntitiesTab>
                  <EntitiesTab entities={permissions}>
                    {_('Permissions')}
                  </EntitiesTab>
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <Details entity={entity} />
                  </TabPanel>
                  <TabPanel>
                    <EntityTags
                      entity={entity}
                      onChanged={onChanged}
                      onError={onError}
                      onInteraction={onInteraction}
                    />
                  </TabPanel>
                  <TabPanel>
                    <TaskPermissions
                      entity={entity}
                      permissions={permissions}
                      onChanged={onChanged}
                      onDownloaded={onDownloaded}
                      onInteraction={onInteraction}
                      onError={onError}
                    />
                  </TabPanel>
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
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const TaskPermissions = withComponentDefaults({
  relatedResourcesLoaders: [
    ({entity, gmp}) =>
      isDefined(entity.alerts)
        ? Promise.resolve([...entity.alerts])
        : Promise.resolve([]),
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

const taskIdFilter = id => Filter.fromString('task_id=' + id).all();

const mapStateToProps = (rootState, {id}) => {
  const permSel = permissionsSelector(rootState);
  const notesSel = notesSelector(rootState);
  const overridesSel = overridesSelector(rootState);
  return {
    notes: notesSel.getEntities(taskIdFilter(id)),
    overrides: overridesSel.getEntities(taskIdFilter(id)),
    permissions: permSel.getEntities(permissionsResourceFilter(id)),
  };
};

const load = gmp => {
  const loadTaskFunc = loadTask(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  const loadNotesFunc = loadNotes(gmp);
  const loadOverridesFunc = loadOverrides(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadTaskFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
      dispatch(loadNotesFunc(taskIdFilter(id))),
      dispatch(loadOverridesFunc(taskIdFilter(id))),
    ]);
};

const reloadInterval = ({defaultReloadInterval, entity}) => {
  if (!isDefined(entity)) {
    return 0;
  }
  return entity.isActive()
    ? DEFAULT_RELOAD_INTERVAL_ACTIVE
    : defaultReloadInterval;
};

export default withEntityContainer('task', {
  load,
  entitySelector: taskSelector,
  mapStateToProps,
  reloadInterval,
})(Page);

// vim: set ts=2 sw=2 tw=80:
