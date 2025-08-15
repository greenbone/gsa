/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate} from 'react-router';
import Gmp from 'gmp/gmp';
import Permission from 'gmp/models/permission';
import PortList from 'gmp/models/portlist';
import {PortListIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
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
import {OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import PortListComponent from 'web/pages/portlists/PortListComponent';
import PortListDetails from 'web/pages/portlists/PortListDetails';
import PortListDetailsPageToolBarIcons from 'web/pages/portlists/PortListDetailsPageToolBarIcons';
import PortRangesTable from 'web/pages/portlists/PortRangesTable';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/portlists';

interface PortListDetailsPageProps {
  entity: PortList;
  isLoading?: boolean;
  links?: boolean;
  permissions?: Permission[];
  onError: (error: Error) => void;
  onChanged: () => void;
  onDownloaded?: OnDownloadedFunc;
}

const PortRanges = ({entity}: {entity: PortList}) => {
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

const PortListDetailsPage = ({
  entity,
  isLoading = true,
  links = true,
  permissions = [],
  onError,
  onChanged,
  onDownloaded,
}: PortListDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <PortListComponent
      onCloneError={onError}
      onCloned={goToDetails('portlist', navigate)}
      onCreated={goToDetails('portlist', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('portlists', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <EntityPage<PortList>
          entity={entity}
          entityType="portlist"
          isLoading={isLoading}
          sectionIcon={<PortListIcon size="large" />}
          title={_('Port List')}
          toolBarIcons={
            <PortListDetailsPageToolBarIcons
              entity={entity}
              onPortListCloneClick={clone}
              onPortListCreateClick={create}
              onPortListDeleteClick={deleteFunc}
              onPortListDownloadClick={download}
              onPortListEditClick={edit}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Port List: {{name}}', {
                    name: entity.name as string,
                  })}
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
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions<PortList>
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
              </>
            );
          }}
        </EntityPage>
      )}
    </PortListComponent>
  );
};

const load = (gmp: Gmp) => {
  const loadEntityFunc = loadEntity(gmp);
  const loadPermissionsFunc = loadPermissions(gmp);
  return (id: string) => dispatch =>
    Promise.all([
      dispatch(loadEntityFunc(id)),
      dispatch(loadPermissionsFunc(permissionsResourceFilter(id))),
    ]);
};

const mapStateToProps = (rootState: unknown, {id}: {id: string}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('portlist', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(PortListDetailsPage);
