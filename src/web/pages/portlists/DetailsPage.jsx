/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {PortListIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
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
import TabsContainer from 'web/components/tab/TabsContainer';
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
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import PortListDetails from 'web/pages/portlists/Details';
import PortListComponent from 'web/pages/portlists/PortListComponent';
import PortRangesTable from 'web/pages/portlists/PortRangesTable';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/portlists';
import PropTypes from 'web/utils/PropTypes';

const ToolBarIcons = ({
  entity,
  onPortListCloneClick,
  onPortListCreateClick,
  onPortListDeleteClick,
  onPortListDownloadClick,
  onPortListEditClick,
}) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="creating-and-managing-port-lists"
          page="scanning"
          title={_('Help: Port Lists')}
        />
        <ListIcon page="portlists" title={_('PortList List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onPortListCreateClick} />
        <CloneIcon entity={entity} onClick={onPortListCloneClick} />
        <EditIcon
          disabled={entity.predefined}
          entity={entity}
          onClick={onPortListEditClick}
        />
        <TrashIcon entity={entity} onClick={onPortListDeleteClick} />
        <ExportIcon
          title={_('Export PortList as XML')}
          value={entity}
          onClick={onPortListDownloadClick}
        />
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onPortListCloneClick: PropTypes.func.isRequired,
  onPortListCreateClick: PropTypes.func.isRequired,
  onPortListDeleteClick: PropTypes.func.isRequired,
  onPortListDownloadClick: PropTypes.func.isRequired,
  onPortListEditClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  return (
    <Layout flex="column">
      <PortListDetails entity={entity} links={links} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const PortRanges = ({entity}) => {
  const [_] = useTranslation();
  const {portRanges = []} = entity;

  return (
    <Layout title={_('Port Ranges ({{count}})', {count: portRanges.length})}>
      {portRanges.length === 0 && _('No port ranges available')}
      {portRanges.length > 0 && (
        <PortRangesTable actions={false} portRanges={portRanges} />
      )}
    </Layout>
  );
};

PortRanges.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  links = true,
  permissions = [],
  onError,
  onChanged,
  onDownloaded,
  onInteraction,
  ...props
}) => {
  const [_] = useTranslation();

  return (
    <PortListComponent
      onCloneError={onError}
      onCloned={goToDetails('portlist', props)}
      onCreated={goToDetails('portlist', props)}
      onDeleteError={onError}
      onDeleted={goToList('portlists', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({clone, create, delete: delete_func, download, edit, save}) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<PortListIcon size="large" />}
          title={_('Port List')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onInteraction={onInteraction}
          onPortListCloneClick={clone}
          onPortListCreateClick={create}
          onPortListDeleteClick={delete_func}
          onPortListDownloadClick={download}
          onPortListEditClick={edit}
          onPortListSaveClick={save}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Port List: {{name}}', {name: entity.name})}
                />
                <TabsContainer flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList align={['start', 'stretch']}>
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.portRanges}>
                        {_('Port Ranges')}
                      </EntitiesTab>
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
                        <PortListDetails entity={entity} links={links} />
                      </TabPanel>
                      <TabPanel>
                        <PortRanges entity={entity} />
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
                </TabsContainer>
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </PortListComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  links: PropTypes.bool,
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

export default withEntityContainer('portlist', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
