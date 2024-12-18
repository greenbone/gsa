/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import AlertIcon from 'web/components/icon/alerticon';
import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';
import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';
import {goto_details, goto_list} from 'web/entity/component';
import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import EntityPage from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import {selector, loadEntity} from 'web/store/entities/alerts';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {
  loadAllEntities as loadAllReportConfigs,
  selector as reportConfigsSelector,
} from 'web/store/entities/reportconfigs';
import {
  loadAllEntities as loadAllReportFormats,
  selector as reportFormatsSelector,
} from 'web/store/entities/reportformats';
import PropTypes from 'web/utils/proptypes';

import AlertComponent from './component';
import AlertDetails from './details';

export const ToolBarIcons = ({
  entity,
  onAlertCloneClick,
  onAlertCreateClick,
  onAlertDeleteClick,
  onAlertDownloadClick,
  onAlertEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        anchor="managing-alerts"
        page="scanning"
        title={_('Help: Alerts')}
      />
      <ListIcon page="alerts" title={_('Alerts List')} />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onAlertCreateClick} />
      <CloneIcon entity={entity} onClick={onAlertCloneClick} />
      <EditIcon entity={entity} onClick={onAlertEditClick} />
      <TrashIcon entity={entity} onClick={onAlertDeleteClick} />
      <ExportIcon
        title={_('Export Alert as XML')}
        value={entity}
        onClick={onAlertDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onAlertCloneClick: PropTypes.func.isRequired,
  onAlertCreateClick: PropTypes.func.isRequired,
  onAlertDeleteClick: PropTypes.func.isRequired,
  onAlertDownloadClick: PropTypes.func.isRequired,
  onAlertEditClick: PropTypes.func.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  reportConfigs,
  reportFormats,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => (
  <AlertComponent
    onCloneError={onError}
    onCloned={goto_details('alert', props)}
    onCreated={goto_details('alert', props)}
    onDeleteError={onError}
    onDeleted={goto_list('alerts', props)}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, create, delete: delete_func, download, edit, save}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<AlertIcon size="large" />}
        title={_('Alert')}
        toolBarIcons={ToolBarIcons}
        onAlertCloneClick={clone}
        onAlertCreateClick={create}
        onAlertDeleteClick={delete_func}
        onAlertDownloadClick={download}
        onAlertEditClick={edit}
        onAlertSaveClick={save}
        onInteraction={onInteraction}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle title={_('Alert: {{name}}', {name: entity.name})} />
              <Layout flex="column" grow="1">
                <TabLayout align={['start', 'end']} grow="1">
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
                      <AlertDetails
                        entity={entity}
                        reportConfigs={reportConfigs}
                        reportFormats={reportFormats}
                      />
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
                      <EntityPermissions
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
              </Layout>
            </React.Fragment>
          );
        }}
      </EntityPage>
    )}
  </AlertComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  const loadAllReportFormatsFunc = loadAllReportFormats(gmp);
  const loadAllReportConfigsFunc = loadAllReportConfigs(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
      dispatch(loadAllReportFormatsFunc()),
      dispatch(loadAllReportConfigsFunc()),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  const reportFormatsSel = reportFormatsSelector(rootState);
  const reportConfigsSel = reportConfigsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
    reportFormats: reportFormatsSel.getAllEntities(),
    reportConfigs: reportConfigsSel.getAllEntities(),
  };
};

export default withEntityContainer('alert', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
