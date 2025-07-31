/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {UserIcon} from 'web/components/icon';
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
import EntityPermissions from 'web/entity/EntityPermissions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import DeleteIcon from 'web/entity/icon/DeleteIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsSubjectFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import UserDetails from 'web/pages/users/Details';
import UserComponent from 'web/pages/users/UserComponent';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/users';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({
  entity,
  onUserCloneClick,
  onUserCreateClick,
  onUserDeleteClick,
  onUserDownloadClick,
  onUserEditClick,
}) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-users"
          page="web-interface-access"
          title={_('Help: Users')}
        />
        <ListIcon page="users" title={_('Users List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onUserCreateClick} />
        <CloneIcon
          entity={entity}
          mayClone={!entity.isSuperAdmin()}
          onClick={onUserCloneClick}
        />
        <EditIcon entity={entity} onClick={onUserEditClick} />
        <DeleteIcon entity={entity} onClick={onUserDeleteClick} />
        <ExportIcon
          title={_('Export User as XML')}
          value={entity}
          onClick={onUserDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onUserCloneClick: PropTypes.func.isRequired,
  onUserCreateClick: PropTypes.func.isRequired,
  onUserDeleteClick: PropTypes.func.isRequired,
  onUserDownloadClick: PropTypes.func.isRequired,
  onUserEditClick: PropTypes.func.isRequired,
};

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,

  ...props
}) => {
  const [_] = useTranslation();

  return (
    <UserComponent
      onCloneError={onError}
      onCloned={goToDetails('user', props)}
      onCreated={goToDetails('user', props)}
      onDeleteError={onError}
      onDeleted={goToList('users', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<UserIcon size="large" />}
          title={_('User')}
          toolBarIcons={ToolBarIcons}
          onUserCloneClick={clone}
          onUserCreateClick={create}
          onUserDeleteClick={delete_func}
          onUserDownloadClick={download}
          onUserEditClick={edit}
          onUserSaveClick={save}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle title={_('User: {{name}}', {name: entity.name})} />
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
                        <UserDetails entity={entity} />
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
    </UserComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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

export default withEntityContainer('user', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
