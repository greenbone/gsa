/* Copyright (C) 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {REPORT_CONFIGS_FILTER_FILTER} from 'gmp/models/filter';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import ManualIcon from 'web/components/icon/manualicon';
import ReportConfigIcon from 'web/components/icon/reportconfigicon';

import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/reportconfigs';

import ReportConfigComponent from './component';
import ReportConfigsTable, {SORT_FIELDS} from './table';
import NewIcon from 'web/components/icon/newicon';

const ToolBarIcons = withCapabilities(
  ({capabilities, onReportConfigCreateClick}) => (
    <IconDivider>
      <ManualIcon
        page="reports"
        anchor="managing-report-configs"
        title={_('Help: Report Configs')}
      />
      {capabilities.mayCreate('report_config') && (
        <NewIcon
          title={_('New Report Config')}
          onClick={onReportConfigCreateClick}
        />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onReportConfigCreateClick: PropTypes.func.isRequired,
};

const ReportConfigsFilterDialog = createFilterDialog({
  sortFields: SORT_FIELDS,
});

const ReportConfigsPage = ({
  onChanged,
  onDownloaded,
  onError,
  onInteraction,
  showSuccess,
  ...props
}) => (
  <ReportConfigComponent
    onCreateError={onError}
    onCreated={onChanged}
    onCloneError={onError}
    onCloned={onChanged}
    onDeleteError={onError}
    onDeleted={onChanged}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onSaveError={onError}
    onSaved={onChanged}
    onInteraction={onInteraction}
  >
    {({
      clone,
      delete: delete_func,
      download,
      edit,
      create: create_func,
      save,
    }) => {
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
            onReportConfigCreateClick={create_func}
            onReportConfigDeleteClick={delete_func}
            onReportConfigCloneClick={clone}
            onReportConfigDownloadClick={download}
            onReportConfigEditClick={edit}
          />
        </React.Fragment>
      );
    }}
  </ReportConfigComponent>
);

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

// vim: set ts=2 sw=2 tw=80:
