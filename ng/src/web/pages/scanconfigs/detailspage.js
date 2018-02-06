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

import glamorous from 'glamorous';

import _ from 'gmp/locale.js';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilties from '../../utils/withCapabilities.js';

import DetailsLink from '../../components/link/detailslink.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import ExportIcon from '../../components/icon/exporticon.js';
import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import StripedTable from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHead from '../../components/table/head.js';
import TableHeader from '../../components/table/header.js';
import TableRow from '../../components/table/row.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import TrashIcon from '../../entity/icon/trashicon.js';

import ScanConfigDetails from './details.js';
import ScanConfigComponent from './component.js';
import Trend from './trend.js';

const TabTitleCount = glamorous.span({
  fontSize: '0.7em',
});

const TabTitle = ({title, count}) => (
  <Layout flex="column" align={['center', 'center']}>
    <span>{title}</span>
    <TabTitleCount>(<i>{(count)}</i>)</TabTitleCount>
  </Layout>
);

TabTitle.propTypes = {
  count: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
};

const ToolBarIcons = withCapabilties(({
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
        page="vulnerabilitymanagement"
        anchor="scan-configuration"
        title={_('Help: ScanConfigs')}
      />
      <ListIcon
        title={_('ScanConfig List')}
        page="scanconfigs"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        entity={entity}
        onClick={onScanConfigCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onScanConfigCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onScanConfigEditClick}
      />
      <TrashIcon
        entity={entity}
        onClick={onScanConfigDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Scan Config as XML')}
        onClick={onScanConfigDownloadClick}
      />
      {capabilities.mayCreate('config') &&
        <Icon
          img="upload.svg"
          title={_('Import Scan Config')}
          onClick={onScanConfigImportClick}
        />
      }
    </IconDivider>
  </Divider>
));

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onScanConfigCloneClick: PropTypes.func.isRequired,
  onScanConfigCreateClick: PropTypes.func.isRequired,
  onScanConfigDeleteClick: PropTypes.func.isRequired,
  onScanConfigDownloadClick: PropTypes.func.isRequired,
  onScanConfigEditClick: PropTypes.func.isRequired,
  onScanConfigImportClick: PropTypes.func.isRequired,
};

const NvtFamilies = ({
  entity,
}) => {
  const {
    family_list = [],
    families,
  } = entity;
  return (
    <Layout>
      {family_list.length > 0 &&
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Family')}
              </TableHead>
              <TableHead>
                {_('NVTs selected')}
              </TableHead>
              <TableHead align={['space-between', 'center']}>
                {_('Trend')}
                <Trend
                  trend={families.trend}
                  titleDynamic={_('The families selection is DYNAMIC. New ' +
                    'families will automatically be added and considered.')}
                  titleStatic={_('The families selection is STATIC. New ' +
                    'families will NOT automatically be added and considered.')}
                />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {family_list.map(family => (
              <TableRow
                key={family.name}
              >
                <TableData>
                  {family.name}
                </TableData>
                <TableData align={['center', 'end']}>
                  <Layout flex align="end">
                    {_('{{count}} of {{max}}', family.nvts)}
                  </Layout>
                </TableData>
                <TableData align={['center', 'center']}>
                  <Trend
                    trend={family.trend}
                    titleDynamic={_('The NVT selection is DYNAMIC. New ' +
                      'NVTs will automatically be added and considered.')}
                    titleStatic={_('The NVT selection is STATIC. New ' +
                      'NVTs will NOT automatically be added and considered.')}
                  />
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      }
    </Layout>
  );
};

NvtFamilies.propTypes = {
  entity: PropTypes.model.isRequired,
};

const ScannerPreferences = ({
  entity,
}) => {
  const {preferences} = entity;

  return (
    <Layout>
      {preferences.scanner.length > 0 &&
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('Value')}
              </TableHead>
              <TableHead>
                {_('Default Value')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.scanner.map(pref => (
              <TableRow
                key={pref.name}
              >
                <TableData>
                  {pref.name}
                </TableData>
                <TableData>
                  {pref.value}
                </TableData>
                <TableData>
                  {pref.default}
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      }
    </Layout>
  );
};

ScannerPreferences.propTypes = {
  entity: PropTypes.model.isRequired,
};

const NvtPreferences = ({
  entity,
}) => {
  const {preferences} = entity;

  return (
    <Layout>
      {preferences.nvt.length > 0 &&
        <StripedTable>
          <TableHeader>
            <TableRow>
              <TableHead>
                {_('NVT')}
              </TableHead>
              <TableHead>
                {_('Name')}
              </TableHead>
              <TableHead>
                {_('Value')}
              </TableHead>
              <TableHead>
                {_('Default Value')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {preferences.nvt.map(pref => (
              <TableRow
                key={pref.nvt.oid + pref.nvt.name + pref.name}
              >
                <TableData>
                  <DetailsLink
                    id={pref.nvt.oid}
                    type="nvt"
                  >
                    {pref.nvt.name}
                  </DetailsLink>
                </TableData>
                <TableData>
                  {pref.name}
                </TableData>
                <TableData>
                  {pref.value}
                </TableData>
                <TableData>
                  {pref.default}
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </StripedTable>
      }
    </Layout>
  );
};

NvtPreferences.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Details = ({
  entity,
  ...props
}) => {
  return (
    <Layout flex="column">
      <ScanConfigDetails
        entity={entity}
        {...props}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  onChanged,
  onDownloaded,
  onError,
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
      onSaved={onChanged}
      onImported={goto_details('scanconfig', props)}
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
          detailsComponent={Details}
          sectionIcon="config.svg"
          toolBarIcons={ToolBarIcons}
          title={_('Scan Config')}
          onScanConfigCloneClick={clone}
          onScanConfigCreateClick={create}
          onScanConfigDeleteClick={delete_func}
          onScanConfigDownloadClick={download}
          onScanConfigEditClick={edit}
          onScanConfigSaveClick={save}
          onScanConfigImportClick={import_func}
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
            const {
              family_list = [],
              preferences,
            } = entity;
            const nvtFamiliesCount = family_list.length;
            const nvtPrefsCount = preferences.nvt.length;
            const scannerPrefsCount = preferences.scanner.length;

            return (
              <Layout grow="1" flex="column">
                <TabLayout
                  grow="1"
                  align={['start', 'end']}>
                  <TabList
                    active={activeTab}
                    align={['start', 'stretch']}
                    onActivateTab={onActivateTab}
                  >
                    <Tab>
                      {_('Information')}
                    </Tab>
                    <Tab>
                      <TabTitle
                        title={_('Scanner Preferences')}
                        count={scannerPrefsCount}
                      />
                    </Tab>
                    <Tab>
                      <TabTitle
                        title={_('NVT Families')}
                        count={nvtFamiliesCount}
                      />
                    </Tab>
                    <Tab>
                      <TabTitle
                        title={_('NVT Preferences')}
                        count={nvtPrefsCount}
                      />
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
                      <Details
                        entity={entity}
                      />
                    </TabPanel>
                    <TabPanel>
                      <ScannerPreferences entity={entity}/>
                    </TabPanel>
                    <TabPanel>
                      <NvtFamilies entity={entity}/>
                    </TabPanel>
                    <TabPanel>
                      <NvtPreferences entity={entity}/>
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
    </ScanConfigComponent>
  );
};

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

const ScanConfigPage = props => (
  <EntityContainer
    {...props}
    name="scanconfig"
    resourceType="config"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default ScanConfigPage;

// vim: set ts=2 sw=2 tw=80:
