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

import ManualIcon from 'web/components/icon/manualicon';
import Icon from 'web/components/icon/icon';
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

import Table from 'web/components/table/stripedtable';
import TableBody from 'web/components/table/body';
import TableData from 'web/components/table/data';
import TableHeader from 'web/components/table/header';
import TableHead from 'web/components/table/head';
import TableRow from 'web/components/table/row';

import EntityPage from 'web/entity/page';
import EntityContainer, {
  permissions_resource_loader,
} from 'web/entity/container';
import {goto_details, goto_list} from 'web/entity/component';
import EntitiesTab from 'web/entity/tab';
import EntityTags from 'web/entity/tags';

import ExportIcon from 'web/components/icon/exporticon';
import CloneIcon from 'web/entity/icon/cloneicon';
import CreateIcon from 'web/entity/icon/createicon';
import EditIcon from 'web/entity/icon/editicon';
import DeleteIcon from 'web/entity/icon/deleteicon';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import ReportFormatComponent from './component';
import ReportFormatDetails from './details';

const ToolBarIcons = withCapabilities(({
  capabilities,
  entity,
  onReportFormatCloneClick,
  onReportFormatImportClick,
  onReportFormatDeleteClick,
  onReportFormatDownloadClick,
  onReportFormatEditClick,
  onReportFormatVerifyClick,
}) => (
  <Divider margin="10px">
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="report-plugins"
        title={_('Help: Report Format Details')}
      />
      <ListIcon
        title={_('Report Formats List')}
        page="reportformats"
      />
    </IconDivider>
    <IconDivider>
      <CreateIcon
        displayName={_('Report Format')}
        entity={entity}
        onClick={onReportFormatImportClick}
      />
      <CloneIcon
        displayName={_('Report Format')}
        entity={entity}
        onClick={onReportFormatCloneClick}
      />
      <EditIcon
        displayName={_('Report Format')}
        entity={entity}
        onClick={onReportFormatEditClick}
      />
      <DeleteIcon
        displayName={_('Report Format')}
        entity={entity}
        onClick={onReportFormatDeleteClick}
      />
      <ExportIcon
        value={entity}
        title={_('Export Report Format as XML')}
        onClick={onReportFormatDownloadClick}
      />
      {capabilities.mayOp('verify_report_format') ?
        <Icon
          img="verify.svg"
          value={entity}
          title={_('Verify Report Format')}
          onClick={onReportFormatVerifyClick}
        /> :
        <Icon
          img="verify_inactive.svg"
          title={_('Permission to verify Report Format denied')}
        />
      }
    </IconDivider>
  </Divider>
));

ToolBarIcons.propTypes = {
  entity: PropTypes.model.isRequired,
  onReportFormatCloneClick: PropTypes.func.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
  onReportFormatDownloadClick: PropTypes.func.isRequired,
  onReportFormatEditClick: PropTypes.func.isRequired,
  onReportFormatImportClick: PropTypes.func.isRequired,
};

const Details = ({
  entity,
  links = true,
}) => {
  return (
    <Layout flex="column">
      <ReportFormatDetails
        entity={entity}
        links={links}
      />
    </Layout>
  );
};

Details.propTypes = {
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

const Parameters = ({entity}) => {
  const {
    params = [],
  } = entity;

  return (
    <Layout>
      {params.length === 0 &&
        _('No parameters available')
      }
      {params.length > 0 &&
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead width="30%">
                {_('Name')}
              </TableHead>
              <TableHead width="70%">
                {_('Value')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {params.map(param => (
              <TableRow
                key={param.name}
              >
                <TableData>
                  {param.name}
                </TableData>
                <TableData>
                  {param.value}
                </TableData>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      }
    </Layout>
  );
};

Parameters.propTypes = {
  entity: PropTypes.model.isRequired,
};

const Page = ({
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
  <ReportFormatComponent
    onCloned={goto_details('reportformat', props)}
    onCloneError={onError}
    onDeleted={goto_list('reportformats', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onImported={goto_details('reportformat', props)}
    onSaved={onChanged}
    onVerify={onChanged}
    onVerifyError={onError}
  >
    {({
      clone,
      delete: delete_func,
      download,
      edit,
      import: import_func,
      save,
      verify,
    }) => (
      <EntityPage
        {...props}
        sectionIcon="report_format.svg"
        title={_('Report Format')}
        toolBarIcons={ToolBarIcons}
        onReportFormatCloneClick={clone}
        onReportFormatImportClick={import_func}
        onReportFormatDeleteClick={delete_func}
        onReportFormatDownloadClick={download}
        onReportFormatEditClick={edit}
        onReportFormatSaveClick={save}
        onReportFormatVerifyClick={verify}
        onPermissionChanged={onChanged}
        onPermissionDownloaded={onDownloaded}
        onPermissionDownloadError={onError}
      >
        {({
          activeTab = 0,
          links = true,
          permissionsComponent,
          permissionsTitle,
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
                  <EntitiesTab entities={entity.params}>
                    {_('Parameters')}
                  </EntitiesTab>
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
                      links={links}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Parameters entity={entity}/>
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
                    {permissionsComponent}
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Layout>
          );
        }}
      </EntityPage>
    )}
  </ReportFormatComponent>
);

Page.propTypes = {
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

const ReportFormatPage = props => (
  <EntityContainer
    {...props}
    name="reportformat"
    loaders={[
      permissions_resource_loader,
    ]}
  >
    {cprops => <Page {...props} {...cprops} />}
  </EntityContainer>
);

export default ReportFormatPage;

// vim: set ts=2 sw=2 tw=80:
