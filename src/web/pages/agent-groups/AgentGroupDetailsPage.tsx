/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate, useParams} from 'react-router';
import type AgentGroup from 'gmp/models/agent-group';
import QueryFilter from 'gmp/models/filter/query-filter';
import useDownload from 'web/components/form/useDownload';
import {HatAndGlassesIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
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
import {useGetAgentGroup} from 'web/hooks/use-query/agent-group';
import {useGetPermissions} from 'web/hooks/use-query/permissions';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupDetails from 'web/pages/agent-groups/AgentGroupDetails';
import AgentGroupDetailsPageToolBarIcons from 'web/pages/agent-groups/AgentGroupDetailsPageToolBarIcons';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';

const AgentGroupDetailsPage = () => {
  const [_] = useTranslation();
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {dialogNotification, showError} = useDialogNotification();
  const {downloadComponent, download} = useDownload();
  const {data: entity, error, isLoading, refetch} = useGetAgentGroup({id});
  const {data: permissionsData, refetch: refetchPermissions} =
    useGetPermissions({
      filter: QueryFilter.fromString(`resource_uuid=${id}`).all(),
      enabled: Boolean(id),
    });
  const permissions = permissionsData?.entities ?? [];

  const handleChanged = () => {
    void refetch();
    void refetchPermissions();
  };

  return (
    <>
      {dialogNotification}
      {downloadComponent}
      <AgentGroupsComponent
        onCloneError={showError}
        onCloned={goToDetails('agentgroup', navigate)}
        onCreateError={showError}
        onCreated={goToDetails('agentgroup', navigate)}
        onDeleteError={showError}
        onDeleted={goToList('agentgroup', navigate)}
        onSaveError={showError}
      >
        {({clone, create, delete: deleteFunc, edit}) => (
          <EntityPage<AgentGroup>
            entity={entity}
            entityError={
              error ? {status: 0, message: error.message} : undefined
            }
            entityType="agentgroup"
            isLoading={isLoading}
            sectionIcon={<HatAndGlassesIcon size="large" />}
            title={_('Agent Group')}
            toolBarIcons={
              <AgentGroupDetailsPageToolBarIcons
                entity={entity as AgentGroup}
                onAgentGroupCloneClick={clone}
                onAgentGroupCreateClick={create}
                onAgentGroupDeleteClick={deleteFunc}
                onAgentGroupEditClick={edit}
              />
            }
          >
            {entity => (
              <>
                <PageTitle
                  title={_('Agent Group: {{name}}', {
                    name: entity.name as string,
                  })}
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
                        <AgentGroupDetails entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <EntityTags
                          entity={entity}
                          onChanged={handleChanged}
                          onError={showError}
                        />
                      </TabPanel>
                      <TabPanel>
                        <EntityPermissions
                          entity={entity}
                          permissions={permissions}
                          onChanged={handleChanged}
                          onDownloaded={download}
                          onError={showError}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabsContainer>
              </>
            )}
          </EntityPage>
        )}
      </AgentGroupsComponent>
    </>
  );
};

export default AgentGroupDetailsPage;
