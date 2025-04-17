/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {REPORT_CONFIGS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import {NewIcon, ReportConfigIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useCapabilities from 'web/hooks/useCapabilities';
import useTranslation from 'web/hooks/useTranslation';
import ReportConfigComponent from 'web/pages/reportconfigs/Component';
import ReportConfigsFilterDialog from 'web/pages/reportconfigs/FilterDialog';
import ReportConfigsTable from 'web/pages/reportconfigs/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reportconfigs';
import PropTypes from 'web/utils/PropTypes';
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
