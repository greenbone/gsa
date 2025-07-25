/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {PermissionIcon} from 'web/components/icon';
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
import EntityTags from 'web/entity/Tags';
import withEntityContainer from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import PermissionDetails from 'web/pages/permissions/Details';
import PermissionComponent from 'web/pages/permissions/PermissionsComponent';
import {selector, loadEntity} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({
  entity,
  onPermissionCloneClick,
  onPermissionCreateClick,
  onPermissionDeleteClick,
  onPermissionDownloadClick,
  onPermissionEditClick,
}) => {
  const [_] = useTranslation();

  return (
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
};

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

  ...props
}) => {
  const [_] = useTranslation();
  return (
    <PermissionComponent
      onCloneError={onError}
      onCloned={goToDetails('permission', props)}
      onCreated={goToDetails('permission', props)}
      onDeleteError={onError}
      onDeleted={goToList('permissions', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<PermissionIcon size="large" />}
          title={_('Permission')}
          toolBarIcons={ToolBarIcons}
          onPermissionCloneClick={clone}
          onPermissionCreateClick={create}
          onPermissionDeleteClick={delete_func}
          onPermissionDownloadClick={download}
          onPermissionEditClick={edit}
          onPermissionSaveClick={save}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Permission: {{name}}', {name: entity.name})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs>
                    <TabPanels>
                      <TabPanel>
                        <PermissionDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
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
    </PermissionComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntityContainer('permission', {
  load: loadEntity,
  entitySelector: selector,
})(Page);
