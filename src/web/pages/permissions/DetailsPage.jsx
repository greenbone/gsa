/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PermissionIcon from 'web/components/icon/PermissionIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import {goToDetails, goToList} from 'web/entity/Component';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import EntityPage from 'web/entity/Page';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import PermissionComponent from 'web/pages/permissions/Component';
import PermissionDetails from 'web/pages/permissions/Details';
import {selector, loadEntity} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';


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
        anchor="managing-permissions"
        page="web-interface-access"
        title={_('Help: Permissions')}
      />
      <ListIcon page="permissions" title={_('Permission List')} />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onPermissionCreateClick} />
      <CloneIcon entity={entity} onClick={onPermissionCloneClick} />
      <EditIcon entity={entity} onClick={onPermissionEditClick} />
      <TrashIcon entity={entity} onClick={onPermissionDeleteClick} />
      <ExportIcon
        title={_('Export Permission as XML')}
        value={entity}
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
  entity,
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  ...props
}) => {
  return (
    <PermissionComponent
      onCloneError={onError}
      onCloned={goToDetails('permission', props)}
      onCreated={goToDetails('permission', props)}
      onDeleteError={onError}
      onDeleted={goToList('permissions', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<PermissionIcon size="large" />}
          title={_('Permission')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onPermissionCloneClick={clone}
          onPermissionCreateClick={create}
          onPermissionDeleteClick={delete_func}
          onPermissionDownloadClick={download}
          onPermissionEditClick={edit}
          onPermissionSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Permission: {{name}}', {name: entity.name})}
                />
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
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <PermissionDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
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
    </PermissionComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntityContainer('permission', {
  load: loadEntity,
  entitySelector: selector,
})(Page);
