/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ExportIcon from 'web/components/icon/ExportIcon';
import { GroupIcon } from 'web/components/icon/icons';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
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
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsSubjectFilter,
} from 'web/entity/withEntityContainer';
import GroupComponent from 'web/pages/groups/Component';
import GroupDetails from 'web/pages/groups/Details';
import {selector, loadEntity} from 'web/store/entities/groups';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({
  entity,
  onGroupCloneClick,
  onGroupCreateClick,
  onGroupDeleteClick,
  onGroupDownloadClick,
  onGroupEditClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        anchor="managing-groups"
        page="web-interface-access"
        title={_('Help: Groups')}
      />
      <ListIcon page="groups" title={_('Groups List')} />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onGroupCreateClick} />
      <CloneIcon entity={entity} onClick={onGroupCloneClick} />
      <EditIcon entity={entity} onClick={onGroupEditClick} />
      <TrashIcon entity={entity} onClick={onGroupDeleteClick} />
      <ExportIcon
        title={_('Export Group as XML')}
        value={entity}
        onClick={onGroupDownloadClick}
      />
    </IconDivider>
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onGroupCloneClick: PropTypes.func.isRequired,
  onGroupCreateClick: PropTypes.func.isRequired,
  onGroupDeleteClick: PropTypes.func.isRequired,
  onGroupDownloadClick: PropTypes.func.isRequired,
  onGroupEditClick: PropTypes.func.isRequired,
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
  const isSpecial =
    permissions.filter(permission => permission.name === 'Super').length > 0;

  return (
    <GroupComponent
      onCloneError={onError}
      onCloned={goToDetails('group', props)}
      onCreated={goToDetails('group', props)}
      onDeleteError={onError}
      onDeleted={goToList('groups', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<GroupIcon size="large" />}
          title={_('Group')}
          toolBarIcons={ToolBarIcons}
          onGroupCloneClick={clone}
          onGroupCreateClick={create}
          onGroupDeleteClick={delete_func}
          onGroupDownloadClick={download}
          onGroupEditClick={edit}
          onGroupSaveClick={save}
          onInteraction={onInteraction}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Group: {{name}}', {name: entity.name})} />
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
                        <GroupDetails entity={entity} isSpecial={isSpecial} />
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
    </GroupComponent>
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
      dispatch(loadPermissionsFunc(permissionsSubjectFilter(id))),
    ]);
};

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsSubjectFilter(id)),
  };
};

export default withEntityContainer('group', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
