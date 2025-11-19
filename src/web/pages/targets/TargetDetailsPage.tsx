/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate} from 'react-router';
import type Gmp from 'gmp/gmp';
import type Model from 'gmp/models/model';
import type Permission from 'gmp/models/permission';
import type Target from 'gmp/models/target';
import {isDefined} from 'gmp/utils/identity';
import {TargetIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TabsContainer from 'web/components/tab/TabsContainer';
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import EntityPermissions from 'web/entity/EntityPermissions';
import {type OnDownloadedFunc} from 'web/entity/hooks/useEntityDownload';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import TargetComponent, {
  TARGET_RESOURCE_PROPERTIES_NAMES,
} from 'web/pages/targets/TargetComponent';
import TargetDetails from 'web/pages/targets/TargetDetails';
import TargetDetailsToolBarIcons from 'web/pages/targets/TargetDetailsTooBarIcons';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/targets';

interface EntityProps {
  entity: Target;
}

interface TargetDetailsPageProps {
  entity: Target;
  isLoading?: boolean;
  permissions?: Permission[];
  onError: (error: Error) => void;
  onChanged: () => void;
  onDownloaded?: OnDownloadedFunc;
}

const relatedResourcesLoaders = [
  ({entity}: EntityProps) => {
    const resources: Model[] = [];
    for (const name of TARGET_RESOURCE_PROPERTIES_NAMES) {
      const cred = entity[name];
      if (isDefined(cred)) {
        resources.push(cred);
      }
    }
    return Promise.resolve(resources);
  },
];

const Details = ({entity}: EntityProps) => {
  const [_] = useTranslation();
  return (
    <Layout flex="column">
      <InfoTable>
        <TableBody>
          <TableRow>
            <TableData>{_('Name')}</TableData>
            <TableData>{entity.name}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{entity.comment}</TableData>
          </TableRow>
        </TableBody>
      </InfoTable>
      <TargetDetails entity={entity} />
    </Layout>
  );
};

const TargetDetailsPage = ({
  entity,
  isLoading = true,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
}: TargetDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <TargetComponent
      onCloneError={onError}
      onCloned={goToDetails('target', navigate)}
      onCreated={goToDetails('target', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('targets', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <EntityPage<Target>
          entity={entity}
          entityType="target"
          isLoading={isLoading}
          sectionIcon={<TargetIcon size="large" />}
          title={_('Target')}
          toolBarIcons={
            <TargetDetailsToolBarIcons
              entity={entity}
              onTargetCloneClick={clone}
              onTargetCreateClick={create}
              onTargetDeleteClick={deleteFunc}
              onTargetDownloadClick={download}
              onTargetEditClick={edit}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Target: {{name}}', {name: entity.name as string})}
                />
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
                        <Details entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={onChanged}
                          onError={onError}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions<Target>
                          entity={entity}
                          permissions={permissions}
                          relatedResourcesLoaders={relatedResourcesLoaders}
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
    </TargetComponent>
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

export default withEntityContainer('target', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(TargetDetailsPage);
