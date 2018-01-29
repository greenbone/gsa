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

import glamorous from 'glamorous';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntityPage from '../../entity/page.js';
import EntityContainer, {
  permissions_resource_loader,
} from '../../entity/container.js';
import {goto_details, goto_list} from '../../entity/component.js';

import ExportIcon from '../../components/icon/exporticon.js';
import CloneIcon from '../../entity/icon/cloneicon.js';
import CreateIcon from '../../entity/icon/createicon.js';
import EditIcon from '../../entity/icon/editicon.js';
import DeleteIcon from '../../entity/icon/deleteicon.js';

import ManualIcon from '../../components/icon/manualicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Tab from '../../components/tab/tab.js';
import TabLayout from '../../components/tab/tablayout.js';
import TabList from '../../components/tab/tablist.js';
import TabPanel from '../../components/tab/tabpanel.js';
import TabPanels from '../../components/tab/tabpanels.js';
import Tabs from '../../components/tab/tabs.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import ReportFormatComponent from './component.js';
import ReportFormatDetails from './details.js';

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

const ToolBarIcons = withCapabilities(({
  capabilities,
  entity,
  onReportFormatCloneClick,
  onReportFormatCreateClick,
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
        entity={entity}
        onClick={onReportFormatCreateClick}
      />
      <CloneIcon
        entity={entity}
        onClick={onReportFormatCloneClick}
      />
      <EditIcon
        entity={entity}
        onClick={onReportFormatEditClick}
      />
      <DeleteIcon
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
  onReportFormatCreateClick: PropTypes.func.isRequired,
  onReportFormatDeleteClick: PropTypes.func.isRequired,
  onReportFormatDownloadClick: PropTypes.func.isRequired,
  onReportFormatEditClick: PropTypes.func.isRequired,
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
  ...props
}) => (
  <ReportFormatComponent
    onCloned={goto_details('reportformat', props)}
    onCloneError={onError}
    onCreated={goto_details('reportformat', props)}
    onDeleted={goto_list('reportformats', props)}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onSaved={onChanged}
    onVerify={onChanged}
    onVerifyError={onError}
  >
    {({
      clone,
      create,
      delete: delete_func,
      download,
      edit,
      save,
      verify,
    }) => (
      <EntityPage
        {...props}
        sectionIcon="report_format.svg"
        title={_('Report Format')}
        detailsComponent={Details}
        toolBarIcons={ToolBarIcons}
        onReportFormatCloneClick={clone}
        onReportFormatCreateClick={create}
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
          tagsComponent,
          tagsTitle,
          onActivateTab,
          entity,
          ...other
        }) => {
          const {
            params = [],
          } = entity;
          const paramsCount = params.length;

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
                  <Tab>
                    <TabTitle
                      title={_('Parameters')}
                      count={paramsCount}
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
                      links={links}
                    />
                  </TabPanel>
                  <TabPanel>
                    <Parameters entity={entity}/>
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
  </ReportFormatComponent>
);

Page.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
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
