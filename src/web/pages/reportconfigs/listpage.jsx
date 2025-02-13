/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {REPORT_CONFIGS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import ReportConfigIcon from 'web/components/icon/reportconfigicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reportconfigs';
import PropTypes from 'web/utils/proptypes';

import ReportConfigComponent from './component';
import ReportConfigsFilterDialog from './filterdialog';
import ReportConfigsTable from './table';

const ToolBarIcons = ({onReportConfigCreateClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="customizing-report-formats-with-report-configurations"
        page="reports"
        title={_('Help: Report Configs')}
      />
      {capabilities.mayCreate('report_config') && (
        <NewIcon
          title={_('New Report Config')}
          onClick={onReportConfigCreateClick}
        />
      )}
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onReportConfigCreateClick: PropTypes.func.isRequired,
};

const ReportConfigsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  showSuccess,
  ...props
}) => {
  const [_] = useTranslation();
  return (
    <ReportConfigComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreateError={onError}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onInteraction={onInteraction}
      onSaveError={onError}
      onSaved={onChanged}
    >
      {({clone, delete: delete_func, download, edit, create: create_func}) => {
        return (
          <React.Fragment>
            <PageTitle title={_('Report Configs')} />
            <EntitiesPage
              {...props}
              filterEditDialog={ReportConfigsFilterDialog}
              filtersFilter={REPORT_CONFIGS_FILTER_FILTER}
              sectionIcon={<ReportConfigIcon size="large" />}
              table={ReportConfigsTable}
              title={_('Report Configs')}
              toolBarIcons={ToolBarIcons}
              onChanged={onChanged}
              onError={onError}
              onInteraction={onInteraction}
              onReportConfigCloneClick={clone}
              onReportConfigCreateClick={create_func}
              onReportConfigDeleteClick={delete_func}
              onReportConfigDownloadClick={download}
              onReportConfigEditClick={edit}
            />
          </React.Fragment>
        );
      }}
    </ReportConfigComponent>
  );
};

ReportConfigsPage.propTypes = {
  showSuccess: PropTypes.func.isRequired,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('reportconfig', {
  entitiesSelector,
  loadEntities,
})(ReportConfigsPage);

export {ToolBarIcons};
