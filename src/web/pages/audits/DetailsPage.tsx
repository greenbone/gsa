/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useQueryClient} from '@tanstack/react-query';
import {useNavigate, useParams} from 'react-router';
import type Gmp from 'gmp/gmp';
import type Audit from 'gmp/models/audit';
import Filter from 'gmp/models/filter';
import type Model from 'gmp/models/model';
import {isDefined} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {AuditIcon} from 'web/components/icon';
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
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableCol from 'web/components/table/TableCol';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import EntityPermissions, {
  type EntityPermissionsProps,
} from 'web/entity/EntityPermissions';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityTags from 'web/entity/Tags';
import {useGetAudit} from 'web/hooks/use-query/audits';
import {useGetPermissions} from 'web/hooks/use-query/permissions';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import AuditComponent from 'web/pages/audits/AuditComponent';
import AuditDetailsPageToolBarIcons from 'web/pages/audits/AuditDetailsPageToolBarIcons';
import AuditDetails from 'web/pages/audits/Details';
import {TARGET_RESOURCE_PROPERTIES_NAMES} from 'web/pages/targets/TargetComponent';
import AuditStatus from 'web/pages/tasks/TaskStatus';
import {renderYesNo} from 'web/utils/Render';
import withComponentDefaults from 'web/utils/withComponentDefaults';

const AuditPermissions = withComponentDefaults<EntityPermissionsProps<Audit>>({
  relatedResourcesLoaders: [
    async ({entity}: {entity: Audit}) => {
      return isDefined(entity.alerts) ? [...entity.alerts] : [];
    },
    async ({entity}: {entity: Audit}) => {
      return [entity.config, entity.scanner, entity.schedule].filter(
        (item): item is Model => isDefined(item),
      );
    },
    async ({entity, gmp}: {entity: Audit; gmp: Gmp}) => {
      if (!isDefined(entity.target)) {
        return [];
      }

      const response = await gmp.target.get({id: entity.target.id as string});
      const target = response.data;
      const resources: Model[] = [target];

      for (const name of TARGET_RESOURCE_PROPERTIES_NAMES) {
        const cred = target[name];
        if (isDefined(cred)) {
          resources.push(cred);
        }
      }
      return resources;
    },
  ],
})(EntityPermissions<Audit>);

const Details = ({entity}: {entity: Audit}) => {
  const [_] = useTranslation();
  return (
    <Layout flex="column">
      <InfoTable>
        <colgroup>
          <TableCol width="10%" />
          <TableCol width="90%" />
        </colgroup>
        <TableBody>
          <TableRow>
            <TableData>{_('Name')}</TableData>
            <TableData>{entity.name}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Comment')}</TableData>
            <TableData>{entity.comment}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Alterable')}</TableData>
            <TableData>{renderYesNo(entity.isAlterable())}</TableData>
          </TableRow>

          <TableRow>
            <TableData>{_('Status')}</TableData>
            <TableData>
              <AuditStatus task={entity} />
            </TableData>
          </TableRow>
        </TableBody>
      </InfoTable>

      <AuditDetails entity={entity} />
    </Layout>
  );
};

const permissionsResourceFilter = (id: string) =>
  Filter.fromString('resource_uuid=' + id).all();

const AuditDetailsPage = () => {
  const [_] = useTranslation();
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const gmp = useGmp();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();

  const getRefetchInterval = (entity?: Audit) => {
    if (!isDefined(entity) || entity.isImport()) {
      return false;
    }
    return entity.isActive()
      ? gmp.settings.reloadIntervalActive
      : gmp.settings.reloadInterval;
  };

  const {data: entity, isLoading} = useGetAudit({
    id: id ?? '',
    refetchInterval: getRefetchInterval,
  });

  const permFilter = permissionsResourceFilter(id ?? '');
  const {data: permissionsData} = useGetPermissions({
    filter: permFilter,
    enabled: Boolean(id),
  });

  const permissions = permissionsData?.entities ?? [];

  const onChanged = () => {
    void queryClient.invalidateQueries({queryKey: ['get_audit']});
  };

  const onError = (error: Error) => {
    showError(error);
  };

  const onDownloaded = handleDownload;

  if (!entity) {
    return (
      <EntityPage<Audit>
        entity={undefined as unknown as Audit}
        entityType="audit"
        isLoading={isLoading}
        sectionIcon={<AuditIcon size="large" />}
        title={_('Audit')}
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
      <AuditComponent
        onCloneError={onError}
        onCloned={goToDetails('audit', navigate)}
        onDeleteError={onError}
        onDeleted={goToList('audits', navigate)}
        onDownloadError={onError}
        onDownloaded={onDownloaded}
        onResumeError={onError}
        onResumed={onChanged}
        onSaved={onChanged}
        onStartError={onError}
        onStarted={onChanged}
        onStopError={onError}
        onStopped={onChanged}
      >
        {({clone, delete: deleteFunc, download, edit, start, stop, resume}) => (
          <EntityPage<Audit>
            entity={entity}
            entityType="audit"
            isLoading={isLoading}
            sectionIcon={<AuditIcon size="large" />}
            title={_('Audit')}
            toolBarIcons={
              <AuditDetailsPageToolBarIcons
                entity={entity}
                onAuditCloneClick={clone}
                onAuditDeleteClick={deleteFunc}
                onAuditDownloadClick={download}
                onAuditEditClick={edit}
                onAuditResumeClick={resume}
                onAuditStartClick={start}
                onAuditStopClick={stop}
              />
            }
          >
            {() => {
              const tabs = [
                {
                  label: _('Information'),
                  panel: <Details entity={entity} />,
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
                    <AuditPermissions
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
                    title={_('Audit: {{name}}', {name: entity.name as string})}
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
      </AuditComponent>
    </>
  );
};

export default AuditDetailsPage;
