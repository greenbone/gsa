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
import {longDate} from 'gmp/locale/date';

import {isDefined} from 'gmp/utils/identity';

import {
  CERTIFICATE_STATUS_INACTIVE,
  CERTIFICATE_STATUS_EXPIRED,
} from 'gmp/models/credential';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import InfoTable from 'web/components/table/infotable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import DetailsBlock from 'web/entity/block';
import EntityPage from 'web/entity/page';
import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';

import PropTypes from 'web/utils/proptypes';

import CredentialDetails from './details';
import CredentialComponent from './component';
import CredentialDownloadIcon from './downloadicon';

const ToolBarIcons = ({
  entity,
  onCredentialCloneClick,
  onCredentialCreateClick,
  onCredentialDeleteClick,
  onCredentialDownloadClick,
  onCredentialEditClick,
  onCredentialInstallerDownloadClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="vulnerabilitymanagement"
        anchor="credentials"
        title={_('Help: Credentials')}
      />
      <ListIcon
        title={_('Credential List')}
        page="credentials"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onCredentialCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onCredentialCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onCredentialEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onCredentialDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Credential as XML')}
        onClick={onCredentialDownloadClick}
      />
    </IconDivider>
    <CredentialDownloadIcon
      credential={entity}
      onDownload={onCredentialInstallerDownloadClick}
    />
  </Divider>
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onCredentialCloneClick: PropTypes.func.isRequired,
  onCredentialCreateClick: PropTypes.func.isRequired,
  onCredentialDeleteClick: PropTypes.func.isRequired,
  onCredentialDownloadClick: PropTypes.func.isRequired,
  onCredentialEditClick: PropTypes.func.isRequired,
  onCredentialInstallerDownloadClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  links = true,
  ...props
}) => {
  const {
    certificate_info: cert,
  } = entity;
  return (
    <Layout flex="column">
      <CredentialDetails
        entity={entity}
        links={links}
      />
      {isDefined(cert) &&
        <DetailsBlock
          title={_('Certificate')}
        >
          <InfoTable>
            <TableBody>
              <TableRow>
                <TableData>
                  {_('Activation')}
                </TableData>
                <TableData>
                  <Divider>
                    <span>
                      {longDate(cert.activationTime)}
                    </span>
                    {cert.time_status === CERTIFICATE_STATUS_INACTIVE &&
                      <span>{_('inactive')}</span>
                    }
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('Expiration')}
                </TableData>
                <TableData>
                  <Divider>
                    <span>
                      {longDate(cert.expirationTime)}
                    </span>
                    {cert.time_status === CERTIFICATE_STATUS_EXPIRED &&
                      <span>{_('expired')}</span>
                    }
                  </Divider>
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('MD5 Fingerprint')}
                </TableData>
                <TableData>
                  {cert.md5_fingerprint}
                </TableData>
              </TableRow>

              <TableRow>
                <TableData>
                  {_('Issued By')}
                </TableData>
                <TableData>
                  {cert.issuer}
                </TableData>
              </TableRow>
            </TableBody>
          </InfoTable>
        </DetailsBlock>
      }
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  return (
    <CredentialComponent
      onCloned={goto_details('credential', props)}
      onCloneError={onError}
      onCreated={goto_details('credential', props)}
      onDeleted={goto_list('credentials', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onInstallerDownloaded={onDownloaded}
      onInstallerDownloadError={onError}
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
          detailsComponent={Details}
          sectionIcon="credential.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Credential')}
          onCredentialCloneClick={clone}
          onCredentialCreateClick={create}
          onCredentialDeleteClick={delete_func}
          onCredentialDownloadClick={download}
          onCredentialEditClick={edit}
          onCredentialInstallerDownloadClick={downloadinstaller}
          onCredentialSaveClick={save}
          onPermissionChanged={onChanged}
          onPermissionDownloadError={onError}
          onPermissionDownloaded={onDownloaded}
        >
          {({
            activeTab = 0,
            permissionsComponent,
            permissionsTitle,
            tagsComponent,
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
                    <EntitiesTab entities={entity.userTags}>
                      {_('User Tags')}
                    </EntitiesTab>
                    <Tab>
                      {permissionsTitle}
                    </Tab>
                  </TabList>
                </TabLayout>

                <Tabs active={activeTab}>
                  <TabPanels>
                    <TabPanel>
                      <Details
                        entity={entity}
                      />
                    </TabPanel>
                    <TabPanel>
                      {tagsComponent}
                    </TabPanel>
                    <TabPanel>
                      {permissionsComponent}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </Layout>
            );
          }}
        </EntityPage>
      )}
    </CredentialComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const CredentialPage = props => (
  <EntityContainer
    {...props}
    name="credential"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default CredentialPage;

// vim: set ts=2 sw=2 tw=80:
