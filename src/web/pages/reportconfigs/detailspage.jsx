/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import React from 'react';
import ListIcon from 'web/components/icon/listicon';
import ManualIcon from 'web/components/icon/manualicon';
import ReportConfigIcon from 'web/components/icon/reportconfigicon';
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
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHead from 'web/components/table/head';
import TableHeader from 'web/components/table/header';
import TableRow from 'web/components/table/row';
import Table from 'web/components/table/stripedtable';
import {goToDetails, goToList} from 'web/entity/component';
import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import EntityPage from 'web/entity/page';
import EntityPermissions from 'web/entity/permissions';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';
import withEntityContainer, {
  permissionsResourceFilter,
} from 'web/entity/withEntityContainer';
import {
  selector as permissionsSelector,
  loadEntities as loadPermissions,
} from 'web/store/entities/permissions';
import {selector, loadEntity} from 'web/store/entities/reportconfigs';
import PropTypes from 'web/utils/proptypes';
import {renderYesNo} from 'web/utils/render';
import withCapabilities from 'web/utils/withCapabilities';

import ReportConfigComponent from './component';
import ReportConfigDetails, {ReportConfigParamValue} from './details';

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
          anchor="customizing-report-formats-with-report-configurations"
          page="reports"
          title={_('Help: Report Configs')}
        />
        <ListIcon page="reportconfigs" title={_('Report Configs List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          displayName={_('Report Config')}
          entity={entity}
          onClick={onReportConfigCreateClick}
        />
        <CloneIcon entity={entity} onClick={onReportConfigCloneClick} />
        <EditIcon
          disabled={entity.predefined}
          displayName={_('Report Config')}
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
                <TableData>{renderYesNo(param.valueUsingDefault)}</TableData>
                <TableData>
                  <ReportConfigParamValue
                    param={param}
                    value={param.default}
                    valueLabels={param.defaultLabels}
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
    onCloneError={onError}
    onCloned={goToDetails('reportconfig', props)}
    onCreateError={onError}
    onCreated={goToDetails('reportconfig', props)}
    onDeleteError={onError}
    onDeleted={goToList('reportconfigs', props)}
    onInteraction={onInteraction}
    onSaveError={onError}
    onSaved={onChanged}
  >
    {({clone, delete: delete_func, edit, create: create_func, save}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<ReportConfigIcon size="large" />}
        title={_('Report Config')}
        toolBarIcons={ToolBarIcons}
        onInteraction={onInteraction}
        onReportConfigCloneClick={clone}
        onReportConfigCreateClick={create_func}
        onReportConfigDeleteClick={delete_func}
        onReportConfigEditClick={edit}
        onReportConfigSaveClick={save}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle
                title={_('Report Config: {{name}}', {name: entity.name})}
              />
              <Layout flex="column" grow="1">
                <TabLayout align={['start', 'end']} grow="1">
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
