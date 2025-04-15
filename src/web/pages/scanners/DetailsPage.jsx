/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {CVE_SCANNER_TYPE} from 'gmp/models/scanner';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import useTranslation from 'src/web/hooks/useTranslation';
import {DownloadKeyIcon, ScannerIcon, VerifyIcon} from 'web/components/icon';
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
import useGmp from 'web/hooks/useGmp';
import ScannerComponent from 'web/pages/scanners/Component';
import ScannerDetails from 'web/pages/scanners/Details';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/scanners';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = ({
  entity,
  onScannerCertificateDownloadClick,
  onScannerCloneClick,
  onScannerCreateClick,
  onScannerCredentialDownloadClick,
  onScannerDeleteClick,
  onScannerDownloadClick,
  onScannerEditClick,
  onScannerVerifyClick,
}) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-scanners"
          page="scanning"
          title={_('Help: Scanners')}
        />
        <ListIcon page="scanners" title={_('Scanner List')} />
      </IconDivider>
      <IconDivider>
        {gmp.settings.enableGreenboneSensor && (
          <CreateIcon entity={entity} onClick={onScannerCreateClick} />
        )}
        <CloneIcon
          entity={entity}
          mayClone={entity.scannerType !== CVE_SCANNER_TYPE}
          onClick={onScannerCloneClick}
        />
        <EditIcon entity={entity} onClick={onScannerEditClick} />
        <TrashIcon entity={entity} onClick={onScannerDeleteClick} />
        <ExportIcon
          title={_('Export Scanner as XML')}
          value={entity}
          onClick={onScannerDownloadClick}
        />
        <VerifyIcon
          title={_('Verify Scanner')}
          value={entity}
          onClick={onScannerVerifyClick}
        />
      </IconDivider>
      <IconDivider>
        {isDefined(entity.credential) && (
          <DownloadKeyIcon
            title={_('Download Certificate')}
            value={entity}
            onClick={onScannerCredentialDownloadClick}
          />
        )}
        {isDefined(entity.caPub) && (
          <DownloadKeyIcon
            title={_('Download CA Certificate')}
            value={entity}
            onClick={onScannerCertificateDownloadClick}
          />
        )}
      </IconDivider>
    </Divider>
  );
};

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScannerCertificateDownloadClick: PropTypes.func.isRequired,
  onScannerCloneClick: PropTypes.func.isRequired,
  onScannerCreateClick: PropTypes.func.isRequired,
  onScannerCredentialDownloadClick: PropTypes.func.isRequired,
  onScannerDeleteClick: PropTypes.func.isRequired,
  onScannerDownloadClick: PropTypes.func.isRequired,
  onScannerEditClick: PropTypes.func.isRequired,
  onScannerVerifyClick: PropTypes.func.isRequired,
};

const Page = (
  {
    entity,
    permissions = [],
    onChanged,
    onDownloaded,
    onError,
    onInteraction,
    showSuccess,
    ...props
  }
) => {
  const [_] = useTranslation();

  return (
    <ScannerComponent
      onCertificateDownloadError={onError}
      onCertificateDownloaded={onDownloaded}
      onCloneError={onError}
      onCloned={goToDetails('scanner', props)}
      onCreated={goToDetails('scanner', props)}
      onCredentialDownloadError={onError}
      onCredentialDownloaded={onDownloaded}
      onDeleteError={onError}
      onDeleted={goToList('scanners', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaved={onChanged}
      onVerified={() => {
        onChanged();
        showSuccess(_('Scanner Verified'));
      }}
      onVerifyError={onError}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        downloadcertificate,
        downloadcredential,
        edit,
        save,
        verify,
      }) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<ScannerIcon size="large" />}
          title={_('Scanner')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onScannerCertificateDownloadClick={downloadcertificate}
          onScannerCloneClick={clone}
          onScannerCreateClick={create}
          onScannerCredentialDownloadClick={downloadcredential}
          onScannerDeleteClick={delete_func}
          onScannerDownloadClick={download}
          onScannerEditClick={edit}
          onScannerSaveClick={save}
          onScannerVerifyClick={verify}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle title={_('Scanner: {{name}}', {name: entity.name})} />
                <Layout flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={entity.userTags}>
                        {_('User Tags')}
                      </EntitiesTab>
                      <EntitiesTab entities={permissions}>
                        {_('Permissions')}
                      </EntitiesTab>
                    </TabList>
                  </TabLayout>

                  <Tabs active={activeTab}>
                    <TabPanels>
                      <TabPanel>
                        <ScannerDetails entity={entity} />
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
                </Layout>
              </React.Fragment>
            );
          }}
        </EntityPage>
      )}
    </ScannerComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  showSuccess: PropTypes.func.isRequired,
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

export default withEntityContainer('scanner', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
