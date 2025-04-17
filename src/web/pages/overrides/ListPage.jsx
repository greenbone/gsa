/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import {NewIcon, OverrideIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import OverrideComponent from 'web/pages/overrides/Component';
import OverridesDashboard, {
  OVERRIDES_DASHBOARD_ID,
} from 'web/pages/overrides/dashboard';
import FilterDialog from 'web/pages/overrides/FilterDialog';
import OverridesTable from 'web/pages/overrides/Table';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/overrides';
import PropTypes from 'web/utils/PropTypes';
import withCapabilities from 'web/utils/withCapabilities';
export const ToolBarIcons = withCapabilities(
  ({capabilities, onOverrideCreateClick}) => (
    <IconDivider>
      <ManualIcon
        anchor="managing-overrides"
        page="reports"
        title={_('Help: Overrides')}
      />

      {capabilities.mayCreate('override') && (
        <NewIcon title={_('New Override')} onClick={onOverrideCreateClick} />
      )}
    </IconDivider>
  ),
);

ToolBarIcons.propTypes = {
  onOverrideCreateClick: PropTypes.func.isRequired,
};

const Page = ({
  filter,
  onChanged,
  onDownloaded,
  onError,
  onFilterChanged,
  onInteraction,
  ...props
}) => (
  <OverrideComponent
    onCloneError={onError}
    onCloned={onChanged}
    onCreated={onChanged}
    onDeleteError={onError}
    onDeleted={onChanged}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onSaved={onChanged}
  >
    {({clone, create, delete: delete_func, download, edit, save}) => (
      <React.Fragment>
        <PageTitle title={_('Overrides')} />
        <EntitiesPage
          {...props}
          dashboard={() => (
            <OverridesDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={OVERRIDES_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filter={filter}
          filterEditDialog={FilterDialog}
          filtersFilter={OVERRIDES_FILTER_FILTER}
          sectionIcon={<OverrideIcon size="large" />}
          table={OverridesTable}
          title={_('Overrides')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onDownloaded={onDownloaded}
          onError={onError}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
          onOverrideCloneClick={clone}
          onOverrideCreateClick={create}
          onOverrideDeleteClick={delete_func}
          onOverrideDownloadClick={download}
          onOverrideEditClick={edit}
          onOverrideSaveClick={save}
        />
      </React.Fragment>
    )}
  </OverrideComponent>
);

Page.propTypes = {
  filter: PropTypes.filter,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('override', {
  entitiesSelector,
  loadEntities,
})(Page);
