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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import {CVE_SCANNER_TYPE} from 'gmp/models/scanner.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import ScannerComponent from './component.js';
import ScannerDetails from './details.js';

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
        {is_defined(entity.credential) &&
          <Icon
            title={_('Download Certificate')}
            img="key.svg"
            value={entity}
            onClick={onScannerCredentialDownloadClick}
          />
        }
        {is_defined(entity.ca_pub) &&
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
  onChanged,
  onDownloaded,
  onError,
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
        detailsComponent={ScannerDetails}
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
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      >
        {({
          activeTab = 0,
          permissionsComponent,
          permissionsTitle,
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
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
                  {is_defined(tagsComponent) &&
                    <Tab>
                      {tagsTitle}
                    </Tab>
                  }
                  {is_defined(permissionsComponent) &&
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  }
                </TabList>
              </TabLayout>

              <Tabs active={activeTab}>
                <TabPanels>
                  <TabPanel>
                    <ScannerDetails
                      entity={entity}
                    />
                  </TabPanel>
                  {is_defined(tagsComponent) &&
                    <TabPanel>
                      {tagsComponent}
                    </TabPanel>
                  }
                  {is_defined(permissionsComponent) &&
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  }
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
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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
