/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
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

import HelpIcon from '../../components/icon/helpicon.js';
import Icon from '../../components/icon/icon.js';
import ListIcon from '../../components/icon/listicon.js';

import Divider from '../../components/layout/divider.js';
import IconDivider from '../../components/layout/icondivider.js';
import Layout from '../../components/layout/layout.js';

import Section from '../../components/section/section.js';

import Table from '../../components/table/stripedtable.js';
import TableBody from '../../components/table/body.js';
import TableData from '../../components/table/data.js';
import TableHeader from '../../components/table/header.js';
import TableHead from '../../components/table/head.js';
import TableRow from '../../components/table/row.js';

import ReportFormatComponent from './component.js';
import ReportFormatDetails from './details.js';

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
      <HelpIcon
        page="report_format_details"
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
  const {
    params = [],
  } = entity;
  return (
    <Layout flex="column">
      <ReportFormatDetails
        entity={entity}
        links={links}
      />
      <Section
        foldable
        title={_('Parameters ({{count}})', {count: params.length})}
      >
        {params.length > 0 &&
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {_('Name')}
                </TableHead>
                <TableHead>
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
      </Section>
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
      />
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
