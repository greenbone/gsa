/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import React from 'react';

import _ from 'gmp/locale';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import ExportIcon from 'web/components/icon/exporticon';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import PolicyIcon from 'web/components/icon/policyicon';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {selector, loadEntity} from 'web/store/entities/policies';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import PolicyDetails from './details';
import PolicyComponent from './component';

import {
  NvtFamilies,
  ScannerPreferences,
  NvtPreferences,
} from 'web/pages/scanconfigs/detailspage';

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

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  return (
    <PolicyComponent
      onCloned={goto_details('policies', props)}
      onCloneError={onError}
      onDeleted={goto_list('policies', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<PolicyIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Policy')}
          onInteraction={onInteraction}
          onPolicyCloneClick={clone}
          onPolicyDeleteClick={delete_func}
          onPolicyDownloadClick={download}
          onPolicyEditClick={edit}
          onPolicySaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            const {preferences} = entity;
            return (
              <React.Fragment>
                <PageTitle title={_('Policy: {{name}}', {name: entity.name})} />
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
                      <EntitiesTab entities={entity.family_list}>
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
                        <Details entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <ScannerPreferences entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <NvtFamilies entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <NvtPreferences entity={entity} />
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
    </PolicyComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

const load = gmp => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return id => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('policy', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
