/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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

import styled from 'styled-components';

import DetailsLink from 'web/components/link/detailslink';

import Divider from 'web/components/layout/divider';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';

import ExportIcon from 'web/components/icon/exporticon';
import ManualIcon from 'web/components/icon/manualicon';
import UploadIcon from 'web/components/icon/uploadicon';
import ListIcon from 'web/components/icon/listicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';

import Link from 'web/components/link/link';

import StripedTable from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';

import {SCAN_CONFIGS_FROM_FEED} from 'web/pages/extras/feedstatuspage';

import {selector, loadEntity} from 'web/store/entities/scanconfigs';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ScanConfigDetails from './details';
import ScanConfigComponent from './component';
import Trend from './trend';

export const ToolBarIcons = withCapabilities(
  ({
    capabilities,
    entity,
    onScanConfigCloneClick,
    onScanConfigCreateClick,
    onScanConfigDeleteClick,
    onScanConfigDownloadClick,
    onScanConfigEditClick,
    onScanConfigImportClick,
  }) => (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="scanning"
          anchor="managing-scan-configurations"
          title={_('Help: ScanConfigs')}
        />
        <ListIcon title={_('ScanConfig List')} page="scanconfigs" />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onScanConfigCreateClick} />
        <CloneIcon entity={entity} onClick={onScanConfigCloneClick} />
        <EditIcon
          entity={entity}
          disabled={SCAN_CONFIGS_FROM_FEED.includes(entity.id)}
          onClick={onScanConfigEditClick}
        />
        <TrashIcon entity={entity} onClick={onScanConfigDeleteClick} />
        <ExportIcon
          value={entity}
          title={_('Export Scan Config as XML')}
          onClick={onScanConfigDownloadClick}
        />
        {capabilities.mayCreate('config') && (
          <UploadIcon
            title={_('Import Scan Config')}
            onClick={onScanConfigImportClick}
          />
        )}
      </IconDivider>
    </Divider>
  ),
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScanConfigCloneClick: PropTypes.func.isRequired,
  onScanConfigCreateClick: PropTypes.func.isRequired,
  onScanConfigDeleteClick: PropTypes.func.isRequired,
  onScanConfigDownloadClick: PropTypes.func.isRequired,
  onScanConfigEditClick: PropTypes.func.isRequired,
  onScanConfigImportClick: PropTypes.func.isRequired,
};

export const NvtFamilies = ({entity}) => {
  const {family_list = [], families} = entity;
  return (
    <Layout>
      {family_list.length > 0 && (
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Family')}</TableHead>
              <TableHead>{_('NVTs selected')}</TableHead>
              <TableHead align={['center', 'center']}>
                <Divider>
                  {_('Trend')}
                  <Trend
                    trend={families.trend}
                    titleDynamic={_(
                      'The families selection is DYNAMIC. New ' +
                        'families will automatically be added and considered.',
                    )}
                    titleStatic={_(
                      'The families selection is STATIC. New ' +
                        'families will NOT automatically be added and considered.',
                    )}
                  />
                </Divider>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {family_list.map(family => (
              <TableRow key={family.name}>
                <TableData>
                  <span>
                    <Link
                      to="nvts"
                      filter={'family="' + family.name + '"'}
                      title={_('NVTs of family {{name}}', {name: family.name})}
                    >
                      {family.name}
                    </Link>
                  </span>
                </TableData>
                <TableData align={['center', 'start']}>
                  <Layout>{_('{{count}} of {{max}}', family.nvts)}</Layout>
                </TableData>
                <TableData align={['center', 'center']}>
                  <Trend
                    trend={family.trend}
                    titleDynamic={_(
                      'The NVT selection is DYNAMIC. New ' +
                        'NVTs will automatically be added and considered.',
                    )}
                    titleStatic={_(
                      'The NVT selection is STATIC. New ' +
                        'NVTs will NOT automatically be added and considered.',
                    )}
                  />
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      )}
    </Layout>
  );
};

NvtFamilies.propTypes = {
  entity: PropTypes.model.isRequired,
};

export const ScannerPreferences = ({entity}) => {
  const {preferences} = entity;

  return (
    <Layout>
      {preferences.scanner.length > 0 && (
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>{_('Name')}</TableHead>
              <TableHead>{_('Value')}</TableHead>
              <TableHead>{_('Default Value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.scanner.map(pref => (
              <TableRow key={pref.name}>
                <TableData>{pref.name}</TableData>
                <TableData>{pref.value}</TableData>
                <TableData>{pref.default}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      )}
    </Layout>
  );
};

ScannerPreferences.propTypes = {
  entity: PropTypes.model.isRequired,
};

const StyledTableData = styled(TableData)`
  word-break: break-all;
`;

export const NvtPreferences = ({entity}) => {
  const {preferences} = entity;

  return (
    <Layout>
      {preferences.nvt.length > 0 && (
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead width="25%">{_('NVT')}</TableHead>
              <TableHead width="25%">{_('Name')}</TableHead>
              <TableHead width="15%">{_('Value')}</TableHead>
              <TableHead>{_('Default Value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.nvt.map(pref => (
              <TableRow key={pref.nvt.oid + pref.nvt.name + pref.name}>
                <TableData>
                  <span>
                    <DetailsLink id={pref.nvt.oid} type="nvt">
                      {pref.nvt.name}
                    </DetailsLink>
                  </span>
                </TableData>
                <TableData>{pref.name}</TableData>
                <StyledTableData>{pref.value}</StyledTableData>
                <StyledTableData>{pref.default}</StyledTableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      )}
    </Layout>
  );
};

NvtPreferences.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Details = ({entity, ...props}) => {
  return (
    <Layout flex="column">
      <ScanConfigDetails entity={entity} {...props} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
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
    <ScanConfigComponent
      onCloned={goto_details('scanconfig', props)}
      onCloneError={onError}
      onCreated={goto_details('scanconfig', props)}
      onDeleted={goto_list('scanconfigs', props)}
      onDeleteError={onError}
      onDownloaded={onDownloaded}
      onDownloadError={onError}
      onImported={goto_details('scanconfig', props)}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        import: import_func,
        save,
      }) => (
        <EntityPage
          {...props}
          entity={entity}
          sectionIcon={<ScanConfigIcon size="large" />}
          toolBarIcons={ToolBarIcons}
          title={_('Scan Config')}
          onInteraction={onInteraction}
          onScanConfigCloneClick={clone}
          onScanConfigCreateClick={create}
          onScanConfigDeleteClick={delete_func}
          onScanConfigDownloadClick={download}
          onScanConfigEditClick={edit}
          onScanConfigSaveClick={save}
          onScanConfigImportClick={import_func}
        >
          {({activeTab = 0, onActivateTab}) => {
            const {preferences} = entity;
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Scan Config: {{name}}', {name: entity.name})}
                />
                <Layout grow="1" flex="column">
                  <TabLayout grow="1" align={['start', 'end']}>
                    <TabList
                      active={activeTab}
                      align={['start', 'stretch']}
                      onActivateTab={onActivateTab}
                    >
                      <Tab>{_('Information')}</Tab>
                      <EntitiesTab entities={preferences.scanner}>
                        {_('Scanner Preferences')}
                      </EntitiesTab>
                      <EntitiesTab entities={entity.family_list}>
                        {_('NVT Families')}
                      </EntitiesTab>
                      <EntitiesTab entities={preferences.nvt}>
                        {_('NVT Preferences')}
                      </EntitiesTab>
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
                        <ScannerPreferences entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <NvtFamilies entity={entity} />
                      </TabPanel>
                      <TabPanel>
                        <NvtPreferences entity={entity} />
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
    </ScanConfigComponent>
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

export default withEntityContainer('scanconfig', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
