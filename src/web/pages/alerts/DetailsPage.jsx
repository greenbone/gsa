/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {AlertIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import AlertComponent from 'web/pages/alerts/AlertComponent';
import AlertDetails from 'web/pages/alerts/Details';
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
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = ({
  entity,
  onAlertCloneClick,
  onAlertCreateClick,
  onAlertDeleteClick,
  onAlertDownloadClick,
  onAlertEditClick,
}) => {
  const [_] = useTranslation();

  return (
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
};

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

  ...props
}) => {
  const [_] = useTranslation();

  return (
    <AlertComponent
      onCloneError={onError}
      onCloned={goToDetails('alert', props)}
      onCreated={goToDetails('alert', props)}
      onDeleteError={onError}
      onDeleted={goToList('alerts', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
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
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle title={_('Alert: {{name}}', {name: entity.name})} />
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
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={entity}
                          permissions={permissions}
                          onChanged={onChanged}
                          onDownloaded={onDownloaded}
                          onError={onError}
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
    </AlertComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  reportConfigs: PropTypes.array,
  reportFormats: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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
