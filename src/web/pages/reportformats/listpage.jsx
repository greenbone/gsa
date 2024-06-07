/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {REPORT_FORMATS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import ImportIcon from 'web/components/icon/importicon';
import ReportFormatIcon from 'web/components/icon/reportformaticon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reportformats';

import ReportFormatComponent from './component';
import ReportFormatsTable, {SORT_FIELDS} from './table';

const ToolBarIcons = withCapabilities(
  ({capabilities, onReportFormatImportClick}) => (
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="managing-report-formats"
        title={_('Help: Report Formats')}
      />
      {capabilities.mayCreate('report_format') && (
        <ImportIcon
          title={_('Import Report Format')}
          onClick={onReportFormatImportClick}
        />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onReportFormatImportClick: PropTypes.func.isRequired,
};

const ReportFormatsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const ReportFormatsPage = ({
  onChanged,
  onError,
  onInteraction,
  showSuccess,
  ...props
}) => (
  <ReportFormatComponent
    onSaved={onChanged}
    onDeleted={onChanged}
    onDeleteError={onError}
    onImported={onChanged}
    onInteraction={onInteraction}
  >
    {({delete: delete_func, edit, import: import_func, save}) => (
      <React.Fragment>
        <PageTitle title={_('Report Formats')} />
        <EntitiesPage
          {...props}
          filterEditDialog={ReportFormatsFilterDialog}
          filtersFilter={REPORT_FORMATS_FILTER_FILTER}
          sectionIcon={<ReportFormatIcon size="large" />}
          table={ReportFormatsTable}
          title={_('Report Formats')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onError={onError}
          onInteraction={onInteraction}
          onReportFormatImportClick={import_func}
          onReportFormatDeleteClick={delete_func}
          onReportFormatEditClick={edit}
        />
      </React.Fragment>
    )}
  </ReportFormatComponent>
);

ReportFormatsPage.propTypes = {
  showSuccess: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('reportformat', {
  entitiesSelector,
  loadEntities,
})(ReportFormatsPage);

// vim: set ts=2 sw=2 tw=80:
