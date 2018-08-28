/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {CVE_SCANNER_TYPE} from 'gmp/models/scanner';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
import ListIcon from 'web/components/icon/listicon';

import EntityPage from 'web/entity/page';
import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import PropTypes from 'web/utils/proptypes';

import ScannerComponent from './component';
import ScannerDetails from './details';

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
  return (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="search"
          searchTerm="scanner"
          title={_('Help: Scanners')}
        />
        <ListIcon
          title={_('Scanner List')}
          page="scanners"
        />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          entity={entity}
          onClick={onScannerCreateClick}
        />
        <CloneIcon
          entity={entity}
          mayClone={entity.scanner_type !== CVE_SCANNER_TYPE}
          onClick={onScannerCloneClick}
        />
        <EditIcon
          entity={entity}
          onClick={onScannerEditClick}
        />
        <TrashIcon
          entity={entity}
          onClick={onScannerDeleteClick}
        />
        <ExportIcon
          value={entity}
          title={_('Export Scanner as XML')}
          onClick={onScannerDownloadClick}
        />
        <Icon
          img="verify.svg"
          value={entity}
          title={_('Verify Scanner')}
          onClick={onScannerVerifyClick}
        />
      </IconDivider>
      <IconDivider>
        {isDefined(entity.credential) &&
          <Icon
            title={_('Download Certificate')}
            img="key.svg"
            value={entity}
            onClick={onScannerCredentialDownloadClick}
          />
        }
        {isDefined(entity.ca_pub) &&
          <Icon
            img="key.svg"
            title={_('Download CA Certificate')}
            value={entity}
            onClick={onScannerCertificateDownloadClick}
          />
        }
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

const Page = ({
  entity,
  permissions = [],
  onChanged,
  onDownloaded,
  onError,
  onTagAddClick,
  onTagCreateClick,
  onTagDeleteClick,
  onTagDisableClick,
  onTagEditClick,
  onTagEnableClick,
  onTagRemoveClick,
  ...props
}) => (
  <ScannerComponent
    onCertificateDownloadError={onError}
    onCertificateDownloaded={onDownloaded}
    onCloned={goto_details('scanner', props)}
    onCloneError={onError}
    onCreated={goto_details('scanner', props)}
    onCredentialDownloaded={onDownloaded}
    onCredentialDownloadError={onError}
    onDeleted={goto_list('scanners', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
    onVerified={onChanged}
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
        sectionIcon="scanner.svg"
        toolBarIcons={ToolBarIcons}
        title={_('Scanner')}
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
        {({
          activeTab = 0,
          onActivateTab,
        }) => {
          return (
            <Layout grow="1" flex="column">
              <TabLayout
                grow="1"
                align={['start', 'end']}
              >
                <TabList
                  active={activeTab}
                  align={['start', 'stretch']}
                  onActivateTab={onActivateTab}
                >
                  <Tab>
                    {_('Information')}
                  </Tab>
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
                    <ScannerDetails
                      entity={entity}
                    />
                  </TabPanel>
                  <TabPanel>
                    <EntityTags
                      entity={entity}
                      onTagAddClick={onTagAddClick}
                      onTagDeleteClick={onTagDeleteClick}
                      onTagDisableClick={onTagDisableClick}
                      onTagEditClick={onTagEditClick}
                      onTagEnableClick={onTagEnableClick}
                      onTagCreateClick={onTagCreateClick}
                      onTagRemoveClick={onTagRemoveClick}
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
            </Layout>
          );
        }}
      </EntityPage>
    )}
  </ScannerComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onTagAddClick: PropTypes.func.isRequired,
  onTagCreateClick: PropTypes.func.isRequired,
  onTagDeleteClick: PropTypes.func.isRequired,
  onTagDisableClick: PropTypes.func.isRequired,
  onTagEditClick: PropTypes.func.isRequired,
  onTagEnableClick: PropTypes.func.isRequired,
  onTagRemoveClick: PropTypes.func.isRequired,
};

const ScannerPage = props => (
  <EntityContainer
    {...props}
    name="scanner"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default ScannerPage;

// vim: set ts=2 sw=2 tw=80:
