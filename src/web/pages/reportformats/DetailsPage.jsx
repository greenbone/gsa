/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {map} from 'gmp/utils/array';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import ReportFormatIcon from 'web/components/icon/ReportFormatIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import PageTitle from 'web/components/layout/PageTitle';
import DetailsLink from 'web/components/link/DetailsLink';
import Tab from 'web/components/tab/Tab';
import TabLayout from 'web/components/tab/TabLayout';
import TabList from 'web/components/tab/TabList';
import TabPanel from 'web/components/tab/TabPanel';
import TabPanels from 'web/components/tab/TabPanels';
import Tabs from 'web/components/tab/Tabs';
import TableBody from 'web/components/table/Body';
import TableData, {TableDataAlignTop} from 'web/components/table/Data';
import TableHead from 'web/components/table/Head';
import TableHeader from 'web/components/table/Header';
import TableRow from 'web/components/table/Row';
import Table from 'web/components/table/StripedTable';
import {goToDetails, goToList} from 'web/entity/Component';
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
import {selector, loadEntity} from 'web/store/entities/reportformats';
import PropTypes from 'web/utils/PropTypes';
import {renderYesNo} from 'web/utils/Render';
import withCapabilities from 'web/utils/withCapabilities';

import ReportFormatComponent from './Component';
import ReportFormatDetails from './Details';

const ToolBarIcons = withCapabilities(
  ({
    capabilities,
    entity,
    onReportFormatImportClick,
    onReportFormatDeleteClick,
    onReportFormatEditClick,
  }) => (
    <Divider margin="10px">
      <IconDivider>
        <ManualIcon
          anchor="managing-report-formats"
          page="reports"
          title={_('Help: Report Formats')}
        />
        <ListIcon page="reportformats" title={_('Report Formats List')} />
      </IconDivider>
      <IconDivider>
        <CreateIcon
          displayName={_('Report Format')}
          entity={entity}
          onClick={onReportFormatImportClick}
        />
        <EditIcon
          disabled={entity.predefined}
          displayName={_('Report Format')}
          entity={entity}
          onClick={onReportFormatEditClick}
        />
        <TrashIcon
          displayName={_('Report Format')}
          entity={entity}
          onClick={onReportFormatDeleteClick}
        />
      </IconDivider>
    </Divider>
  ),
);

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
  onReportFormatEditClick: PropTypes.func.isRequired,
  onReportFormatImportClick: PropTypes.func.isRequired,
};

const Details = ({entity, links = true}) => {
  return (
    <Layout flex="column">
      <ReportFormatDetails entity={entity} links={links} />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};
const ReportFormatParamValue = ({
  param,
  value = param.value,
  value_labels = param.value_labels,
  links = true,
}) => {
  if (param.type === 'report_format_list') {
    return map(value, report_format_id => {
      const label = isDefined(value_labels[report_format_id])
        ? value_labels[report_format_id]
        : report_format_id;
      return (
        <DetailsLink
          key={param.name + '_' + report_format_id}
          id={report_format_id}
          textOnly={!links}
          type="reportformat"
        >
          {label}
        </DetailsLink>
      );
    });
  } else if (param.type === 'multi_selection') {
    const OptionsList = styled.ul`
      margin: 0;
      padding-left: 1em;
    `;
    return (
      <OptionsList>
        {param.value.map(option => (
          <li key={param.name + '=' + option}>{option}</li>
        ))}
      </OptionsList>
    );
  } else if (param.type === 'text') {
    return <pre>{value}</pre>;
  } else if (param.type === 'boolean') {
    return renderYesNo(value);
  }

  return value;
};

ReportFormatParamValue.propTypes = {
  links: PropTypes.bool,
  param: PropTypes.any.isRequired,
  value: PropTypes.any,
  value_labels: PropTypes.object,
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
              <TableHead width="30%">{_('Name')}</TableHead>
              <TableHead width="70%">{_('Value')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map(param => (
              <TableRow key={param.name}>
                <TableDataAlignTop>{param.name}</TableDataAlignTop>
                <TableData>
                  <ReportFormatParamValue param={param} value={param.value} />
                </TableData>
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
  <ReportFormatComponent
    onDeleteError={onError}
    onDeleted={goToList('reportformats', props)}
    onImported={goToDetails('reportformat', props)}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({delete: delete_func, edit, import: import_func, save}) => (
      <EntityPage
        {...props}
        entity={entity}
        sectionIcon={<ReportFormatIcon size="large" />}
        title={_('Report Format')}
        toolBarIcons={ToolBarIcons}
        onInteraction={onInteraction}
        onReportFormatDeleteClick={delete_func}
        onReportFormatEditClick={edit}
        onReportFormatImportClick={import_func}
        onReportFormatSaveClick={save}
      >
        {({activeTab = 0, onActivateTab}) => {
          return (
            <React.Fragment>
              <PageTitle
                title={_('Report Format: {{name}}', {name: entity.name})}
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
                      {_('Parameters')}
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
  </ReportFormatComponent>
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

export default withEntityContainer('reportformat', {
  entitySelector: selector,
  load,
  mapStateToProps,
})(Page);
