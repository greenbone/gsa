/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {
  CERTIFICATE_STATUS_INACTIVE,
  CERTIFICATE_STATUS_EXPIRED,
} from 'gmp/models/credential';
import {isDefined} from 'gmp/utils/identity';
import DateTime from 'web/components/date/DateTime';
import {CredentialIcon} from 'web/components/icon';
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
import InfoTable from 'web/components/table/InfoTable';
import TableBody from 'web/components/table/TableBody';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import DetailsBlock from 'web/entity/Block';
import EntitiesTab from 'web/entity/EntitiesTab';
import EntityPage from 'web/entity/EntityPage';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import {goToDetails, goToList} from 'web/entity/navigation';
import EntityPermissions from 'web/entity/Permissions';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import useTranslation from 'web/hooks/useTranslation';
import CredentialComponent from 'web/pages/credentials/CredentialsComponent';
import CredentialDetails from 'web/pages/credentials/Details';
import CredentialDownloadIcon from 'web/pages/credentials/DownloadIcon';
import {selector, loadEntity} from 'web/store/entities/credentials';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import PropTypes from 'web/utils/PropTypes';
export const ToolBarIcons = ({
  entity,
  onCredentialCloneClick,
  onCredentialCreateClick,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialEditClick,
  onCredentialInstallerDownloadClick,
}) => {
  const [_] = useTranslation();

  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-credentials"
          page="scanning"
          title={_('Help: Credentials')}
        />
        <ListIcon page="credentials" title={_('Credential List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onCredentialCreateClick} />
        <CloneIcon entity={entity} onClick={onCredentialCloneClick} />
        <EditIcon entity={entity} onClick={onCredentialEditClick} />
        <TrashIcon entity={entity} onClick={onCredentialDeleteClick} />
        <ExportIcon
          title={_('Export Credential as XML')}
          value={entity}
          onClick={onCredentialDownloadClick}
        />
      </IconDivider>
      <CredentialDownloadIcon
        credential={entity}
        onDownload={onCredentialInstallerDownloadClick}
      />
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCredentialCloneClick: PropTypes.func.isRequired,
  onCredentialCreateClick: PropTypes.func.isRequired,
  onCredentialDeleteClick: PropTypes.func.isRequired,
  onCredentialDownloadClick: PropTypes.func.isRequired,
  onCredentialEditClick: PropTypes.func.isRequired,
  onCredentialInstallerDownloadClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  const [_] = useTranslation();
  const {certificate_info: cert} = entity;
  return (
    <Layout flex="column">
      <CredentialDetails entity={entity} links={links} />
      {isDefined(cert) && (
        <DetailsBlock title={_('Certificate')}>
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>{_('Activation')}</TableData>
                <TableData>
                  <Divider>
                    <DateTime date={cert.activationTime} />
                    {cert.time_status === CERTIFICATE_STATUS_INACTIVE && (
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
                    {cert.time_status === CERTIFICATE_STATUS_EXPIRED && (
                      <span>{_('expired')}</span>
                    )}
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>{_('MD5 Fingerprint')}</TableData>
                <TableData>{cert.md5_fingerprint}</TableData>
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

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
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
    <CredentialComponent
      onCloneError={onError}
      onCloned={goToDetails('credential', props)}
      onCreated={goToDetails('credential', props)}
      onDeleteError={onError}
      onDeleted={goToList('credentials', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInstallerDownloadError={onError}
      onInstallerDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        downloadinstaller,
        edit,
        save,
      }) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<CredentialIcon size="large" />}
          title={_('Credential')}
          toolBarIcons={ToolBarIcons}
          onCredentialCloneClick={clone}
          onCredentialCreateClick={create}
          onCredentialDeleteClick={delete_func}
          onCredentialDownloadClick={download}
          onCredentialEditClick={edit}
          onCredentialInstallerDownloadClick={downloadinstaller}
          onCredentialSaveClick={save}
        >
          {() => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Credential: {{name}}', {name: entity.name})}
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
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </CredentialComponent>
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
})(Page);
