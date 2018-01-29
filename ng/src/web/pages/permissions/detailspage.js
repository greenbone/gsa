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

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import EntityPage from '../../entity/page.js';
import EntityContainer from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import ListIcon from '../../components/icon/listicon.js';

import PermissionDetails from './details.js';
import PermissionComponent from './component.js';

const ToolBarIcons = ({
  entity,
  onPermissionCloneClick,
  onPermissionCreateClick,
  onPermissionDeleteClick,
  onPermissionDownloadClick,
  onPermissionEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="gui_administration"
        anchor="permissions"
        title={_('Help: Permissions')}
      />
      <ListIcon
        title={_('Permission List')}
        page="permissions"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onPermissionCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onPermissionCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onPermissionEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onPermissionDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Permission as XML')}
        onClick={onPermissionDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onPermissionCloneClick: PropTypes.func.isRequired,
  onPermissionCreateClick: PropTypes.func.isRequired,
  onPermissionDeleteClick: PropTypes.func.isRequired,
  onPermissionDownloadClick: PropTypes.func.isRequired,
  onPermissionEditClick: PropTypes.func.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  return (
    <PermissionComponent
      onCloned={goto_details('permission', props)}
      onCloneError={onError}
      onCreated={goto_details('permission', props)}
      onDeleted={goto_list('permissions', props)}
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
          detailsComponent={PermissionDetails}
          permissionsComponent={false}
          sectionIcon="permission.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Permission')}
          onPermissionCloneClick={clone}
          onPermissionCreateClick={create}
          onPermissionDeleteClick={delete_func}
          onPermissionDownloadClick={download}
          onPermissionEditClick={edit}
          onPermissionSaveClick={save}
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
                    {is_defined(tagsComponent) &&
                      <Tab>
                        {tagsTitle}
                      </Tab>
                    }
                    {is_defined(permissionsComponent) &&
                      <Tab>
                        {permissionsTitle}
                      </Tab>
                    }
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <PermissionDetails
                        entity={entity}
                      />
                    </TabPanel>
                    {is_defined(tagsComponent) &&
                      <TabPanel>
                        {tagsComponent}
                      </TabPanel>
                    }
                    {is_defined(permissionsComponent) &&
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
    </PermissionComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const PermissionPage = props => (
  <EntityContainer
    {...props}
    name="permission"
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default PermissionPage;

// vim: set ts=2 sw=2 tw=80:
