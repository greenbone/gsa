/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {useNavigate} from 'react-router';
import Gmp from 'gmp/gmp';
import Permission from 'gmp/models/permission';
import Scanner from 'gmp/models/scanner';
import {ScannerIcon} from 'web/components/icon';
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
import ScannerComponent from 'web/pages/scanners/ScannerComponent';
import ScannerDetails from 'web/pages/scanners/ScannerDetails';
import ScannerDetailsPageToolBarIcons from 'web/pages/scanners/ScannerDetailsPageToolBarIcons';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/scanners';

interface ScannerDetailsPageProps {
  entity: Scanner;
  isLoading?: boolean;
  permissions: Permission[];
  onChanged?: () => void;
  onDownloaded: OnDownloadedFunc;
  onError: (error: Error) => void;
  showSuccess: (message: string) => void;
}

const ScannerDetailsPage = ({
  entity,
  isLoading = false,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  showSuccess,
}: ScannerDetailsPageProps) => {
  const [_] = useTranslation();
  const navigate = useNavigate();
  return (
    <ScannerComponent
      onCertificateDownloaded={onDownloaded}
      onCloneError={onError}
      onCloned={goToDetails('scanner', navigate)}
      onCreated={goToDetails('scanner', navigate)}
      onCredentialDownloadError={onError}
      onCredentialDownloaded={onDownloaded}
      onDeleteError={onError}
      onDeleted={goToList('scanners', navigate)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
      onVerified={() => {
        onChanged && onChanged();
        showSuccess(_('Scanner Verified'));
      }}
      onVerifyError={onError}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        downloadCertificate,
        downloadCredential,
        edit,
        verify,
      }) => (
        <EntityPage<Scanner>
          entity={entity}
          entityType="scanner"
          isLoading={isLoading}
          sectionIcon={<ScannerIcon size="large" />}
          title={_('Scanner')}
          toolBarIcons={
            <ScannerDetailsPageToolBarIcons
              entity={entity}
              onScannerCertificateDownloadClick={downloadCertificate}
              onScannerCloneClick={clone}
              onScannerCreateClick={create}
              onScannerCredentialDownloadClick={downloadCredential}
              onScannerDeleteClick={deleteFunc}
              onScannerDownloadClick={download}
              onScannerEditClick={edit}
              onScannerVerifyClick={verify}
            />
          }
        >
          {() => {
            return (
              <>
                <PageTitle
                  title={_('Scanner: {{name}}', {name: entity.name as string})}
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
                        <ScannerDetails entity={entity} />
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
    </ScannerComponent>
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

const mapStateToProps = (rootState, {id}: {id: string}) => {
  const permissionsSel = permissionsSelector(rootState);
  return {
    permissions: permissionsSel.getEntities(permissionsResourceFilter(id)),
  };
};

export default withEntityContainer('scanner', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(ScannerDetailsPage);
