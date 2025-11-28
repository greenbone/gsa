/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useNavigate} from 'react-router';
import type Gmp from 'gmp/gmp';
import {
  type default as Credential,
  CERTIFICATE_STATUS_INACTIVE,
  CERTIFICATE_STATUS_EXPIRED,
} from 'gmp/models/credential';
import type Permission from 'gmp/models/permission';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import {CredentialIcon} from 'web/components/icon';
import Divider from 'web/components/layout/Divider';
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
import DetailsBlock from 'web/entity/Block';
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
import CredentialComponent from 'web/pages/credentials/CredentialComponent';
import CredentialDetails from 'web/pages/credentials/CredentialDetails';
import CredentialDetailsPageToolBarIcons from 'web/pages/credentials/CredentialDetailsPageToolBarIcons';
import {selector, loadEntity} from 'web/store/entities/credentials';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

interface DetailsProps {
  entity: Credential;
}

interface CredentialDetailsPageProps {
  entity: Credential;
  isLoading: boolean;
  permissions?: Permission[];
  onChanged?: () => void;
  onDownloaded?: OnDownloadedFunc;
  onError?: (error: Error) => void;
}

const Details = ({entity}: DetailsProps) => {
  const [_] = useTranslation();
  const {certificateInfo: cert} = entity;
  return (
    <Layout flex="column">
      <CredentialDetails entity={entity} />
      {isDefined(cert) && (
        <DetailsBlock title={_('Certificate')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Activation')}</TableData>
                <TableData>
                  <Divider>
                    <DateTime date={cert.activationTime} />
                    {cert.timeStatus === CERTIFICATE_STATUS_INACTIVE && (
                      <span>{_('inactive')}</span>
                    )}
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('Expiration')}</TableData>
                <TableData>
                  <Divider>
                    <DateTime date={cert.expirationTime} />
                    {cert.timeStatus === CERTIFICATE_STATUS_EXPIRED && (
                      <span>{_('expired')}</span>
                    )}
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('MD5 Fingerprint')}</TableData>
                <TableData>{cert.md5Fingerprint}</TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('SHA-256 Fingerprint')}</TableData>
                <TableData>{cert.sha256Fingerprint}</TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('Issued By')}</TableData>
                <TableData>{cert.issuer}</TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      )}
    </Layout>
  );
};

const CredentialDetailsPage = ({
  entity,
  isLoading,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
}: CredentialDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <CredentialComponent
      onCloneError={onError}
      onCloned={goToDetails('credential', navigate)}
      onCreated={goToDetails('credential', navigate)}
      onDeleteError={onError}
      onDeleted={goToList('credentials', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInstallerDownloadError={onError}
      onInstallerDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        downloadInstaller,
        edit,
      }) => (
        <EntityPage<Credential>
          entity={entity}
          entityType="credential"
          isLoading={isLoading}
          sectionIcon={<CredentialIcon size="large" />}
          title={_('Credential')}
          toolBarIcons={
            <CredentialDetailsPageToolBarIcons
              entity={entity}
              onCredentialCloneClick={clone}
              onCredentialCreateClick={create}
              onCredentialDeleteClick={deleteFunc}
              onCredentialDownloadClick={download}
              onCredentialEditClick={edit}
              onCredentialInstallerDownloadClick={downloadInstaller}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Credential: {{name}}', {
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
              </>
            );
          }}
        </EntityPage>
      )}
    </CredentialComponent>
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

const mapStateToProps = (rootState, {id}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('credential', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(CredentialDetailsPage);
