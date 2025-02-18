/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import styled from 'styled-components';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import ScanConfigIcon from 'web/components/icon/ScanConfigIcon';
import UploadIcon from 'web/components/icon/UploadIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TableBody from 'web/components/table/Body';
import TableData from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import StripedTable from 'web/components/table/StripedTable';
import {goToDetails, goToList} from 'web/entity/Component';
import CloneIcon from 'web/entity/icon/CloneIcon';
import CreateIcon from 'web/entity/icon/CreateIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import EntityPage from 'web/entity/Page';
import EntityPermissions from 'web/entity/Permissions';
import EntitiesTab from 'web/entity/Tab';
import EntityTags from 'web/entity/Tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/scanconfigs';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';

import ScanConfigComponent from './Component';
import ScanConfigDetails from './Details';
import Trend from './Trend';

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
          anchor="managing-scan-configurations"
          page="scanning"
          title={_('Help: ScanConfigs')}
        />
        <ListIcon page="scanconfigs" title={_('ScanConfig List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon entity={entity} onClick={onScanConfigCreateClick} />
        <CloneIcon entity={entity} onClick={onScanConfigCloneClick} />
        <EditIcon
          disabled={entity.predefined}
          entity={entity}
          onClick={onScanConfigEditClick}
        />
        <TrashIcon entity={entity} onClick={onScanConfigDeleteClick} />
        <ExportIcon
          title={_('Export Scan Config as XML')}
          value={entity}
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
                    titleDynamic={_(
                      'The families selection is DYNAMIC. New ' +
                        'families will automatically be added and considered.',
                    )}
                    titleStatic={_(
                      'The families selection is STATIC. New ' +
                        'families will NOT automatically be added and considered.',
                    )}
                    trend={families.trend}
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
                      filter={'family="' + family.name + '"'}
                      title={_('NVTs of family {{name}}', {name: family.name})}
                      to="nvts"
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
                    titleDynamic={_(
                      'The NVT selection is DYNAMIC. New ' +
                        'NVTs will automatically be added and considered.',
                    )}
                    titleStatic={_(
                      'The NVT selection is STATIC. New ' +
                        'NVTs will NOT automatically be added and considered.',
                    )}
                    trend={family.trend}
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
      onCloneError={onError}
      onCloned={goToDetails('scanconfig', props)}
      onCreated={goToDetails('scanconfig', props)}
      onDeleteError={onError}
      onDeleted={goToList('scanconfigs', props)}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onImported={goToDetails('scanconfig', props)}
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
          title={_('Scan Config')}
          toolBarIcons={ToolBarIcons}
          onInteraction={onInteraction}
          onScanConfigCloneClick={clone}
          onScanConfigCreateClick={create}
          onScanConfigDeleteClick={delete_func}
          onScanConfigDownloadClick={download}
          onScanConfigEditClick={edit}
          onScanConfigImportClick={import_func}
          onScanConfigSaveClick={save}
        >
          {({activeTab = 0, onActivateTab}) => {
            const {preferences} = entity;
            return (
              <React.Fragment>
                <PageTitle
                  title={_('Scan Config: {{name}}', {name: entity.name})}
                />
                <Layout flex="column" grow="1">
                  <TabLayout align={['start', 'end']} grow="1">
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
