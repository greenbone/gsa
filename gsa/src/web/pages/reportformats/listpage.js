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

import {REPORT_FORMATS_FILTER_FILTER} from 'gmp/models/filter.js';

import PropTypes from '../../utils/proptypes.js';
import withCapabilities from '../../utils/withCapabilities.js';

import EntitiesPage from '../../entities/page.js';
import withEntitiesContainer from '../../entities/withEntitiesContainer.js';

import ManualIcon from '../../components/icon/manualicon.js';
import NewIcon from '../../components/icon/newicon.js';

import IconDivider from '../../components/layout/icondivider.js';

import {createFilterDialog} from '../../components/powerfilter/dialog.js';

import ReportFormatComponent from './component.js';
import ReportFormatsTable, {SORT_FIELDS} from './table.js';

const ToolBarIcons = withCapabilities(({
  capabilities,
  onReportFormatImportClick,
}) => (
  <IconDivider>
    <ManualIcon
      page="reports"
      anchor="report-plugins"
      title={_('Help: Report Formats')}
    />
    {capabilities.mayCreate('report_format') &&
      <NewIcon
        title={_('Import Report Format')}
        onClick={onReportFormatImportClick}
      />
    }
  </IconDivider>
));

ToolBarIcons.propTypes = {
  onReportFormatImportClick: PropTypes.func.isRequired,
};

const ReportFormatsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const ReportFormatsPage = ({
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <ReportFormatComponent
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onImported={onChanged}
    onVerified={onChanged}
    onVerifyError={onError}
  >{({
    clone,
    delete: delete_func,
    download,
    edit,
    import: import_func,
    save,
    verify,
  }) => (
    <EntitiesPage
      {...props}
      filterEditDialog={ReportFormatsFilterDialog}
      sectionIcon="report_format.svg"
      table={ReportFormatsTable}
      title={_('Report Formats')}
      toolBarIcons={ToolBarIcons}
      onChanged={onChanged}
      onDownloaded={onDownloaded}
      onError={onError}
      onReportFormatCloneClick={clone}
      onReportFormatImportClick={import_func}
      onReportFormatDeleteClick={delete_func}
      onReportFormatDownloadClick={download}
      onReportFormatEditClick={edit}
      onReportFormatVerifyClick={verify}
    />
  )}
  </ReportFormatComponent>
);

ReportFormatsPage.propTypes = {
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
};

export default withEntitiesContainer('reportformat', {
  filtersFilter: REPORT_FORMATS_FILTER_FILTER,
})(ReportFormatsPage);

// vim: set ts=2 sw=2 tw=80:
