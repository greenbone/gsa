/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import _ from 'gmp/locale';
import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/controls';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import OverrideIcon from 'web/components/icon/overrideicon';
import IconDivider from 'web/components/layout/icondivider';
import PageTitle from 'web/components/layout/pagetitle';
import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/overrides';
import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import OverrideComponent from './component';
import OverridesDashboard, {OVERRIDES_DASHBOARD_ID} from './dashboard';
import FilterDialog from './filterdialog';
import OverridesTable from './table';

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

// vim: set ts=2 sw=2 tw=80:
