/* Copyright (C) 2019-2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React, {useEffect} from 'react';
import {useHistory, useParams} from 'react-router-dom';

import _ from 'gmp/locale';

import {hasValue} from 'gmp/utils/identity';

import Download from 'web/components/form/download';
import useDownload from 'web/components/form/useDownload';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import PolicyIcon from 'web/components/icon/policyicon';

import useReload from 'web/components/loading/useReload';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import EntityPage from 'web/entity/page';
import {goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import useEntityReloadInterval from 'web/entity/useEntityReloadInterval';
import {permissionsResourceFilter} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {useGetPolicy} from 'web/graphql/policies';
import {useGetPermissions} from 'web/graphql/permissions';
import {goto_entity_details} from 'web/utils/graphql';

import {
  NvtFamilies,
  ScannerPreferences,
  NvtPreferences,
} from 'web/pages/scanconfigs/detailspage';

import PropTypes from 'web/utils/proptypes';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';
import withCapabilities from 'web/utils/withCapabilities';

import PolicyDetails from './details';
import PolicyComponent from './component';

export const ToolBarIcons = withCapabilities(
  ({
    capabilities,
    entity,
    onPolicyCloneClick,
    onPolicyDeleteClick,
    onPolicyDownloadClick,
    onPolicyEditClick,
  }) => (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="compliance-and-special-scans"
          anchor="configuring-and-managing-policies"
          title={_('Help: Policies')}
        />
        <ListIcon title={_('Policies List')} page="policies" />
      </IconDivider>
      <IconDivider>
        <CloneIcon
          entity={entity}
          displayName={_('Policy')}
          onClick={onPolicyCloneClick}
        />
        <EditIcon
          disabled={entity.predefined}
          entity={entity}
          displayName={_('Policy')}
          onClick={onPolicyEditClick}
        />
        <TrashIcon
          entity={entity}
          displayName={_('Policy')}
          onClick={onPolicyDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Policy as XML')}
          onClick={onPolicyDownloadClick}
        />
      </IconDivider>
    </Divider>
  ),
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onPolicyCloneClick: PropTypes.func.isRequired,
  onPolicyDeleteClick: PropTypes.func.isRequired,
  onPolicyDownloadClick: PropTypes.func.isRequired,
  onPolicyEditClick: PropTypes.func.isRequired,
};

const Details = ({entity, ...props}) => {
  return (
    <Layout flex="column">
      <PolicyDetails entity={entity} {...props} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({onChanged, onError, ...props}) => {
  // Page methods
  const {id} = useParams();
  const history = useHistory();
  const [, renewSessionTimeout] = useUserSessionTimeout();
  const [downloadRef, handleDownload] = useDownload();
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  // Load policy related entities
  const {
    policy,
    refetch: refetchPolicy,
    loading,
    error: entityError,
  } = useGetPolicy(id, {fetchPolicy: 'no-cache'}); // if we allow caching, all scanner preferences will be parsed as auto_enable_dependencies
  const {permissions = [], refetch: refetchPermissions} = useGetPermissions({
    filterString: permissionsResourceFilter(id).toFilterString(),
  });

  // Timeout and reload
  const timeoutFunc = useEntityReloadInterval(policy);

  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetchPolicy,
    timeoutFunc,
  );

  useEffect(() => {
    // start reloading if policy is available and no timer is running yet
    if (hasValue(policy) && !hasRunningTimer) {
      startReload();
    }
  }, [policy, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);
  return (
    <PolicyComponent
      onCloned={goto_entity_details('policies', {history})}
      onCloneError={showError}
      onDeleted={goto_list('policies', {history})}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onInteraction={renewSessionTimeout}
      onSaved={onChanged}
    >
      {({clone, delete: delete_func, download, edit, save}) => (
        <EntityPage
          entity={policy}
          entityError={entityError}
          entityType={'policy'}
          isLoading={loading}
          sectionIcon={<PolicyIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Policy')}
          onInteraction={renewSessionTimeout}
          onPolicyCloneClick={clone}
          onPolicyDeleteClick={delete_func}
          onPolicyDownloadClick={download}
          onPolicyEditClick={edit}
          onPolicySaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            const {preferences} = policy;
            return (
              <React.Fragment>
                <PageTitle title={_('Policy: {{name}}', {name: policy.name})} />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={preferences.scanner}>
                        {_('Scanner Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={policy.familyList}>
                        {_('NVT Families')}
                      </EntitiesTab>
                      <EntitiesTab entities={preferences.nvt}>
                        {_('NVT Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <Details entity={policy} />
                      </TabPanel>
                      <TabPanel>
                        <ScannerPreferences entity={policy} />
                      </TabPanel>
                      <TabPanel>
                        <NvtFamilies entity={policy} />
                      </TabPanel>
                      <TabPanel>
                        <NvtPreferences entity={policy} />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={policy}
                          permissions={permissions}
                          onChanged={() => refetchPermissions()}
                          onDownloaded={handleDownload}
                          onError={onError}
                          onInteraction={renewSessionTimeout}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </Layout>
                <DialogNotification
                  {...notificationDialogState}
                  onCloseClick={closeNotificationDialog}
                />
                <Download ref={downloadRef} />
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </PolicyComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default Page;

// vim: set ts=2 sw=2 tw=80:
