/* Copyright (C) 2024 Greenbone AG
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

import CreateIcon from 'web/entity/icon/createicon';
import TrashIcon from 'web/entity/icon/trashicon';
import Divider from 'web/components/layout/divider';
import EditIcon from 'web/entity/icon/editicon';
import IconDivider from 'web/components/layout/icondivider';
import Layout from 'web/components/layout/layout';
import PageTitle from 'web/components/layout/pagetitle';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import ReportConfigIcon from 'web/components/icon/reportconfigicon';

import Tab from 'web/components/tab/tab';
import TabLayout from 'web/components/tab/tablayout';
import TabList from 'web/components/tab/tablist';
import TabPanel from 'web/components/tab/tabpanel';
import TabPanels from 'web/components/tab/tabpanels';
import Tabs from 'web/components/tab/tabs';

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import EntityPage from 'web/entity/page';
import {goto_details, goto_list} from 'web/entity/component';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';

import {selector, loadEntity} from 'web/store/entities/reportconfigs';

import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';

import {renderYesNo} from 'web/utils/render';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ReportConfigComponent from './component';
import ReportConfigDetails, {ReportConfigParamValue} from './details';
import CloneIcon from 'web/entity/icon/cloneicon';

const ToolBarIcons = withCapabilities(
  ({
    capabilities,
    entity,
    onReportConfigCloneClick,
    onReportConfigCreateClick,
    onReportConfigDeleteClick,
    onReportConfigEditClick,
  }) => (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          page="reports"
          anchor="managing-report-configs"
          title={_('Help: Report Configs')}
        />
        <ListIcon title={_('Report Configs List')} page="reportconfigs" />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          displayName={_('Report Config')}
          entity={entity}
          onClick={onReportConfigCreateClick}
        />
        <CloneIcon entity={entity} onClick={onReportConfigCloneClick} />
        <EditIcon
          displayName={_('Report Config')}
          disabled={entity.predefined}
          entity={entity}
          onClick={onReportConfigEditClick}
        />
        <TrashIcon
          displayName={_('Report Config')}
          entity={entity}
          onClick={onReportConfigDeleteClick}
        />
      </IconDivider>
    </Divider>
  ),
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportConfigCreateClick: PropTypes.func.isRequired,
  onReportConfigDeleteClick: PropTypes.func.isRequired,
  onReportConfigEditClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  return (
    <Layout flex="column">
      <ReportConfigDetails entity={entity} links={links} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const Parameters = ({entity}) => {
  const {params = []} = entity;
  return (
    <Layout>
      {params.length === 0 && _('No parameters available')}
      {params.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead width="20%">{_('Name')}</TableHead>
              <TableHead width="30%">{_('Value')}</TableHead>
              <TableHead width="10%">{_('Using Default')}</TableHead>
              <TableHead width="30%">{_('Default Value')}</TableHead>
              <TableHead width="5%">{_('Minimum')}</TableHead>
              <TableHead width="5%">{_('Maximum')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map(param => (
              <TableRow key={param.name}>
                <TableData>{param.name}</TableData>
                <TableData>
                  <ReportConfigParamValue param={param} />
                </TableData>
                <TableData>{renderYesNo(param.value_using_default)}</TableData>
                <TableData>
                  <ReportConfigParamValue
                    param={param}
                    value={param.default}
                    value_labels={param.default_labels}
                  />
                </TableData>
                <TableData>{param.min}</TableData>
                <TableData>{param.max}</TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Layout>
  );
};

Parameters.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
  entity,
  links = true,
  permissions = [],
  onChanged,
  onError,
  onInteraction,
  ...props
}) => (
  <ReportConfigComponent
    onDeleted={goto_list('reportconfigs', props)}
    onDeleteError={onError}
    onCloned={goto_details('reportconfig', props)}
    onCloneError={onError}
    onCreated={goto_details('reportconfig', props)}
    onCreateError={onError}
    onInteraction={onInteraction}
    onSaved={onChanged}
    onSaveError={onError}
  >
    {({clone, delete: delete_func, edit, create: create_func, save}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<ReportConfigIcon size="large" />}
        title={_('Report Config')}
        toolBarIcons={ToolBarIcons}
        onInteraction={onInteraction}
        onReportConfigCreateClick={create_func}
        onReportConfigDeleteClick={delete_func}
        onReportConfigEditClick={edit}
        onReportConfigSaveClick={save}
        onReportConfigCloneClick={clone}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle
                title={_('Report Config: {{name}}', {name: entity.name})}
              />
              <Layout grow="1" flex="column">
                <TabLayout grow="1" align={['start', 'end']}>
                  <TabList
                    active={activeTab}
                    align={['start', 'stretch']}
                    onActivateTab={onActivateTab}
                  >
                    <Tab>{_('Information')}</Tab>
                    <EntitiesTab entities={entity.params}>
                      {_('Parameter Details')}
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
                      <Details entity={entity} links={links} />
                    </TabPanel>
                    <TabPanel>
                      <Parameters entity={entity} />
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
  </ReportConfigComponent>
);

Page.propTypes = {
  entity: PropTypes.model,
  links: PropTypes.bool,
  permissions: PropTypes.array,
  onChanged: PropTypes.func.isRequired,
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

export default withEntityContainer('reportconfig', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);

// vim: set ts=2 sw=2 tw=80:
