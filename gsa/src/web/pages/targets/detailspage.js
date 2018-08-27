/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbHH
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

import {isDefined} from 'gmp/utils/identity';

import {TARGET_CREDENTIAL_NAMES} from 'gmp/models/target';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

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

import EntityPage from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';
import withComponentDefaults from 'web/utils/withComponentDefaults';

import TargetDetails from './details';
import TargetComponent from './component';

const ToolBarIcons = ({
  entity,
  onTargetCloneClick,
  onTargetCreateClick,
  onTargetDeleteClick,
  onTargetDownloadClick,
  onTargetEditClick,
}) => {
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="vulnerabilitymanagement"
          anchor="creating-a-target"
          title={_('Help: Targets')}
        />
        <ListIcon
          title={_('Target List')}
          page="targets"
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          onClick={onTargetCreateClick}
        />
        <CloneIcon
          entity={entity}
          onClick={onTargetCloneClick}
        />
        <EditIcon
          entity={entity}
          onClick={onTargetEditClick}
        />
        <TrashIcon
          entity={entity}
          onClick={onTargetDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Target as XML')}
          onClick={onTargetDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onTargetCloneClick: PropTypes.func.isRequired,
  onTargetCreateClick: PropTypes.func.isRequired,
  onTargetDeleteClick: PropTypes.func.isRequired,
  onTargetDownloadClick: PropTypes.func.isRequired,
  onTargetEditClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  ...props
}) => (
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
      </TableBody>
    </InfoTable>

    <TargetDetails
      entity={entity}
      {...props}
    />
  </Layout>
);

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  onTagAddClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagEditClick,
  onTagEnableClick,
  onTagRemoveClick,
  ...props
}) => {
  return (
    <TargetComponent
      onCloned={goto_details('target', props)}
      onCloneError={onError}
      onCreated={goto_details('target', props)}
      onDeleted={goto_list('targets', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        save,
      }) => (
        <EntityPage
          {...props}
          permissionsComponent={TargetPermissions}
          sectionIcon="target.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Target')}
          onTargetCloneClick={clone}
          onTargetCreateClick={create}
          onTargetDeleteClick={delete_func}
          onTargetDownloadClick={download}
          onTargetEditClick={edit}
          onTargetSaveClick={save}
          onPermissionChanged={onChanged}
          onPermissionDownloaded={onDownloaded}
          onPermissionDownloadError={onError}
        >
          {({
            activeTab = 0,
            permissionsComponent,
            permissionsTitle,
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
                    <EntitiesTab entities={entity.userTags}>
                      {_('User Tags')}
                    </EntitiesTab>
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <TargetDetails
                        entity={entity}
                      />
                    </TabPanel>
                    <TabPanel>
                      <EntityTags
                        entity={entity}
                        onTagAddClick={onTagAddClick}
                        onTagDeleteClick={onTagDeleteClick}
                        onTagDisableClick={onTagDisableClick}
                        onTagEditClick={onTagEditClick}
                        onTagEnableClick={onTagEnableClick}
                        onTagCreateClick={onTagCreateClick}
                        onTagRemoveClick={onTagRemoveClick}
                      />
                    </TabPanel>
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Layout>
            );
          }}
        </EntityPage>
      )}
    </TargetComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

const TargetPermissions = withComponentDefaults({
  relatedResourcesLoaders: [
    ({entity}) => {
      const resources = [];
      for (const name of ['port_list', ...TARGET_CREDENTIAL_NAMES]) {
        const cred = entity[name];
        if (isDefined(cred)) {
          resources.push(cred);
        }
      }
      return Promise.resolve(resources);
    },
  ],
})(EntityPermissions);

const TargetPage = props => (
  <EntityContainer
    {...props}
    name="target"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default TargetPage;

// vim: set ts=2 sw=2 tw=80:
