/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router';
import Filter from 'gmp/models/filter';
import type Policy from 'gmp/models/policy';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {PolicyIcon} from 'web/components/icon';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
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
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import {useGetPermissions} from 'web/hooks/use-query/permissions';
import {useGetPolicy} from 'web/hooks/use-query/policies';
import useTranslation from 'web/hooks/useTranslation';
import PolicyDetails from 'web/pages/policies/Details';
import PolicyComponent from 'web/pages/policies/PoliciesComponent';
import PolicyDetailsPageToolBarIcons from 'web/pages/policies/PolicyDetailsPageToolBarIcons';
import {
  NvtFamilies,
  ScannerPreferences,
  NvtPreferences,
} from 'web/pages/scanconfigs//DetailsPage';

const Details = ({entity}: {entity: Policy}) => {
  return (
    <Layout flex="column">
      <PolicyDetails entity={entity} />
    </Layout>
  );
};

const permissionsResourceFilter = (id: string) =>
  Filter.fromString('resource_uuid=' + id).all();

const PolicyDetailsPage = () => {
  const [_] = useTranslation();
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();

  const {data: entity, isLoading} = useGetPolicy({id: id ?? ''});

  const permFilter = permissionsResourceFilter(id ?? '');
  const {data: permissionsData} = useGetPermissions({
    filter: permFilter,
    enabled: Boolean(id),
  });

  const permissions = permissionsData?.entities ?? [];

  const onChanged = () => {
    void queryClient.invalidateQueries({queryKey: ['get_policy']});
  };

  const onError = (error: Error) => {
    showError(error);
  };

  const onDownloaded = handleDownload;

  if (!entity) {
    return (
      <EntityPage<Policy>
        entity={undefined as unknown as Policy}
        entityType="policy"
        isLoading={isLoading}
        sectionIcon={<PolicyIcon size="large" />}
        title={_('Policy')}
        toolBarIcons={<div />}
      >
        {() => null}
      </EntityPage>
    );
  }

  return (
    <>
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
      <Download ref={downloadRef} />
      <PolicyComponent
        onCloneError={onError}
        onCloned={goToDetails('policy', navigate)}
        onDeleteError={onError}
        onDeleted={goToList('policies', navigate)}
        onDownloadError={onError}
        onDownloaded={onDownloaded}
        onSaved={onChanged}
      >
        {({clone, delete: deleteFunc, download, edit}) => (
          <EntityPage<Policy>
            entity={entity}
            entityType="policy"
            isLoading={isLoading}
            sectionIcon={<PolicyIcon size="large" />}
            title={_('Policy')}
            toolBarIcons={
              <PolicyDetailsPageToolBarIcons
                entity={entity}
                onPolicyCloneClick={clone}
                onPolicyDeleteClick={deleteFunc}
                onPolicyDownloadClick={download}
                onPolicyEditClick={edit}
              />
            }
          >
            {() => {
              const {preferences} = entity;
              const tabs = [
                {
                  label: _('Information'),
                  panel: <Details entity={entity} />,
                },
                {
                  label: _('Scanner Preferences'),
                  entities: preferences.scanner,
                  panel: <ScannerPreferences entity={entity} />,
                },
                {
                  label: _('NVT Families'),
                  entities: entity.family_list,
                  panel: <NvtFamilies entity={entity} />,
                },
                {
                  label: _('NVT Preferences'),
                  entities: preferences.nvt,
                  panel: <NvtPreferences entity={entity} />,
                },
                {
                  label: _('User Tags'),
                  entities: entity.userTags,
                  panel: (
                    <EntityTags
                      entity={entity}
                      onChanged={onChanged}
                      onError={onError}
                    />
                  ),
                },
                {
                  label: _('Permissions'),
                  entities: permissions,
                  panel: (
                    <EntityPermissions<Policy>
                      entity={entity}
                      permissions={permissions}
                      onChanged={onChanged}
                      onDownloaded={onDownloaded}
                      onError={onError}
                    />
                  ),
                },
              ];

              return (
                <>
                  <PageTitle
                    title={_('Policy: {{name}}', {
                      name: entity.name as string,
                    })}
                  />
                  <TabsContainer flex="column" grow="1">
                    <TabLayout align={['start', 'end']} grow="1">
                      <TabList align={['start', 'stretch']}>
                        {tabs.map(({label, entities}) =>
                          entities === undefined ? (
                            <Tab key={label}>{label}</Tab>
                          ) : (
                            <EntitiesTab key={label} entities={entities}>
                              {label}
                            </EntitiesTab>
                          ),
                        )}
                      </TabList>
                    </TabLayout>

                    <Tabs>
                      <TabPanels>
                        {tabs.map(({label, panel}) => (
                          <TabPanel key={label}>{panel}</TabPanel>
                        ))}
                      </TabPanels>
                    </Tabs>
                  </TabsContainer>
                </>
              );
            }}
          </EntityPage>
        )}
      </PolicyComponent>
    </>
  );
};

export default PolicyDetailsPage;
