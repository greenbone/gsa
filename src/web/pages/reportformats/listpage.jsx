/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {REPORT_FORMATS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ImportIcon from 'web/components/icon/importicon';
import ManualIcon from 'web/components/icon/manualicon';
import ReportFormatIcon from 'web/components/icon/reportformaticon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reportformats';
import PropTypes from 'web/utils/proptypes';

import ReportFormatComponent from './component';
import ReportFormatsFilterDialog from './filterdialog';
import ReportFormatsTable from './table';

const ToolBarIcons = ({onReportFormatImportClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-report-formats"
        page="reports"
        title={_('Help: Report Formats')}
      />
      {capabilities.mayCreate('report_format') && (
        <ImportIcon
          title={_('Import Report Format')}
          onClick={onReportFormatImportClick}
        />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onReportFormatImportClick: PropTypes.func.isRequired,
};

const ReportFormatsPage = ({
  onChanged,
  onError,
  onInteraction,
  showSuccess,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <ReportFormatComponent
      onDeleteError={onError}
      onDeleted={onChanged}
      onImported={onChanged}
      onInteraction={onInteraction}
      onSaved={onChanged}
    >
      {({delete: delete_func, edit, import: import_func}) => (
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
            onReportFormatDeleteClick={delete_func}
            onReportFormatEditClick={edit}
            onReportFormatImportClick={import_func}
          />
        </React.Fragment>
      )}
    </ReportFormatComponent>
  );
};

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
