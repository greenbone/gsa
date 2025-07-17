/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Filter from 'gmp/models/filter';
import {TARGET_CREDENTIAL_NAMES} from 'gmp/models/target';
import {isDefined} from 'gmp/utils/identity';
import Badge from 'web/components/badge/Badge';
import {
  AlterableIcon,
  NoteIcon,
  OverrideIcon,
  ReportIcon,
  ResultIcon,
  TaskIcon,
} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
} from 'web/components/loading/Reload';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import TaskDetails from 'web/pages/tasks/Details';
import NewIconMenu from 'web/pages/tasks/icons/NewIconMenu';
import TaskIconWithSync from 'web/pages/tasks/icons/TaskIconWithSync';
import TaskImportReportIcon from 'web/pages/tasks/icons/TaskImportReportIcon';
import TaskScheduleIcon from 'web/pages/tasks/icons/TaskScheduleIcon';
import TaskStopIcon from 'web/pages/tasks/icons/TaskStopIcon';
import TaskComponent from 'web/pages/tasks/TaskComponentComponent';
import TaskStatus from 'web/pages/tasks/TaskStatus';
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
import compose from 'web/utils/Compose';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import {formattedUserSettingShortDate} from 'web/utils/userSettingTimeDateFormatters';
import withComponentDefaults from 'web/utils/withComponentDefaults';
import withTranslation from 'web/utils/withTranslation';
export const ToolBarIcons = ({
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
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          anchor="managing-tasks"
          page="scanning"
          title={_('Help: Tasks')}
        />
        <ListIcon page="tasks" title={_('Task List')} />
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
          title={_('Export Task as XML')}
          value={entity}
          onClick={onTaskDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {isDefined(entity.schedule) && (
          <TaskScheduleIcon links={links} schedule={entity.schedule} />
        )}
        <TaskIconWithSync
          task={entity}
          type="start"
          onClick={onTaskStartClick}
        />

        <TaskImportReportIcon task={entity} onClick={onReportImportClick} />

        <TaskStopIcon task={entity} onClick={onTaskStopClick} />

        {!entity.isContainer() && (
          <TaskIconWithSync
            task={entity}
            type="resume"
            onClick={onTaskResumeClick}
          />
        )}
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {isDefined(entity.current_report) && (
            <DetailsLink
              id={entity.current_report.id}
              title={_('Current Report for Task {{- name}} from {{- date}}', {
                name: entity.name,
                date: formattedUserSettingShortDate(
                  entity.current_report.scan_start,
                ),
              })}
              type="report"
            >
              <ReportIcon />
            </DetailsLink>
          )}

          {!isDefined(entity.current_report) &&
            isDefined(entity.last_report) && (
              <DetailsLink
                id={entity.last_report.id}
                title={_('Last Report for Task {{- name}} from {{- date}}', {
                  name: entity.name,
                  date: formattedUserSettingShortDate(
                    entity.last_report.scan_start,
                  ),
                })}
                type="report"
              >
                <ReportIcon />
              </DetailsLink>
            )}

          <Link
            filter={'task_id=' + entity.id}
            title={_('Total Reports for Task {{- name}}', entity)}
            to="reports"
          >
            <Badge content={entity.report_count.total}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          filter={'task_id=' + entity.id}
          title={_('Results for Task {{- name}}', entity)}
          to="results"
        >
          <Badge content={entity.result_count}>
            <ResultIcon />
          </Badge>
        </Link>

        <IconDivider>
          <Link
            filter={'task_id=' + entity.id}
            title={_('Notes for Task {{- name}}', entity)}
            to="notes"
          >
            <Badge content={notes.length}>
              <NoteIcon />
            </Badge>
          </Link>

          <Link
            filter={'task_id=' + entity.id}
            title={_('Overrides for Task {{- name}}', entity)}
            to="overrides"
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
  const [_] = useTranslation();
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
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

class Page extends React.Component {
  componentDidUpdate() {
    const {entity, navigate} = this.props;
    if (isDefined(entity) && entity.usageType === 'audit') {
      return navigate('/audit/' + entity.id, {replace: true});
    }
  }

  render() {
    const {_} = this.props;

    const {
      entity,
      permissions = [],
      onChanged,
      onDownloaded,
      onError,
      onInteraction,
      ...props
    } = this.props;
    return (
      <TaskComponent
        onCloneError={onError}
        onCloned={goToDetails('task', props)}
        onContainerCreated={goToDetails('task', props)}
        onContainerSaved={onChanged}
        onCreated={goToDetails('task', props)}
        onDeleteError={onError}
        onDeleted={goToList('tasks', props)}
        onDownloadError={onError}
        onDownloaded={onDownloaded}
        onInteraction={onInteraction}
        onReportImported={onChanged}
        onResumeError={onError}
        onResumed={onChanged}
        onSaved={onChanged}
        onStartError={onError}
        onStarted={onChanged}
        onStopError={onError}
        onStopped={onChanged}
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
            {() => {
              return (
                <React.Fragment>
                  <PageTitle title={_('Task: {{name}}', {name: entity.name})} />
                  <TabsContainer flex="column" grow="1">
                    <TabLayout align={['start', 'end']} grow="1">
                      <TabList align={['start', 'stretch']}>
                        <Tab>{_('Information')}</Tab>
                        <EntitiesTab entities={entity.userTags}>
                          {_('User Tags')}
                        </EntitiesTab>
                        <EntitiesTab entities={permissions}>
                          {_('Permissions')}
                        </EntitiesTab>
                      </TabList>
                    </TabLayout>

                    <Tabs>
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
                            onError={onError}
                            onInteraction={onInteraction}
                          />
                        </TabPanel>
                      </TabPanels>
                    </Tabs>
                  </TabsContainer>
                </React.Fragment>
              );
            }}
          </EntityPage>
        )}
      </TaskComponent>
    );
  }
}

Page.propTypes = {
  entity: PropTypes.model,
  navigate: PropTypes.func.isRequired,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
  _: PropTypes.func.isRequired,
};

export const TaskPermissions = withComponentDefaults({
  relatedResourcesLoaders: [
    ({entity}) =>
      isDefined(entity.alerts)
        ? Promise.resolve([...entity.alerts])
        : Promise.resolve([]),
    ({entity}) => {
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

export const reloadInterval = ({entity}) => {
  if (!isDefined(entity) || entity.isContainer()) {
    return NO_RELOAD;
  }
  return entity.isActive()
    ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE
    : USE_DEFAULT_RELOAD_INTERVAL;
};

export default withEntityContainer('task', {
  load,
  entitySelector: taskSelector,
  mapStateToProps,
  reloadInterval,
})(compose(withTranslation)(Page));
