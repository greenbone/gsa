/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import {
  CERTIFICATE_STATUS_INACTIVE,
  CERTIFICATE_STATUS_EXPIRED,
} from 'gmp/models/credential';

import DateTime from 'web/components/date/datetime';

import CredentialIcon from 'web/components/icon/credentialicon';
import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import ListIcon from 'web/components/icon/listicon';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

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
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import {selector, loadEntity} from 'web/store/entities/credentials';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

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
        page="scanning"
        anchor="managing-credentials"
        title={_('Help: Credentials')}
      />
      <ListIcon title={_('Credential List')} page="credentials" />
    </IconDivider>
    <IconDivider>
      <CreateIcon entity={entity} onClick={onCredentialCreateClick} />
      <CloneIcon entity={entity} onClick={onCredentialCloneClick} />
      <EditIcon entity={entity} onClick={onCredentialEditClick} />
      <TrashIcon entity={entity} onClick={onCredentialDeleteClick} />
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

const Details = ({entity, links = true, ...props}) => {
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
  onInteraction,
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
      onInteraction={onInteraction}
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
          toolBarIcons={ToolBarIcons}
          title={_('Credential')}
          onCredentialCloneClick={clone}
          onCredentialCreateClick={create}
          onCredentialDeleteClick={delete_func}
          onCredentialDownloadClick={download}
          onCredentialEditClick={edit}
          onCredentialInstallerDownloadClick={downloadinstaller}
          onCredentialSaveClick={save}
          onInteraction={onInteraction}
        >
          {({activeTab = 0, onActivateTab}) => {
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Credential: {{name}}', {name: entity.name})}
                />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
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
                        <Details entity={entity} />
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
    </CredentialComponent>
  );
};

Page.propTypes = {
  entity: PropTypes.model,
  permissions: PropTypes.array,
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

export default withEntityContainer('credential', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
