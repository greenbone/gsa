/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {OVERRIDES_FILTER_FILTER} from 'gmp/models/filter';
import type Override from 'gmp/models/override';
import DashboardControls from 'web/components/dashboard/Controls';
import {OverrideIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import OverridesDashboard, {
  OVERRIDES_DASHBOARD_ID,
} from 'web/pages/overrides/dashboard';
import OverrideComponent from 'web/pages/overrides/OverrideComponent';
import OverrideFilterDialog from 'web/pages/overrides/OverrideFilterDialog';
import OverrideListPageToolBarIcons from 'web/pages/overrides/OverrideListPageToolBarIcons';
import OverridesTable from 'web/pages/overrides/OverrideTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/overrides';

const OverrideListPage = ({
  entities,
  entitiesCounts,
  entitiesError,
  filter,
  isLoading,
  selectionType,
  sortBy,
  sortDir,
  onChanged,
  onDeleteBulk,
  onDownloadBulk,
  onDownloaded,
  onEntityDeselected,
  onEntitySelected,
  onError,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
  onSelectionTypeChange,
  onSortChange,
  onTagsBulk,
}: WithEntitiesContainerComponentProps<Override>) => {
  const [_] = useTranslation();
  return (
    <OverrideComponent
      onCloneError={onError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={onError}
      onDeleted={onChanged}
      onDownloadError={onError}
      onDownloaded={onDownloaded}
      onSaved={onChanged}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => (
        <>
          <PageTitle title={_('Overrides')} />
          <EntitiesPage
            createFilterType="override"
            dashboard={() => (
              <OverridesDashboard
                filter={filter}
                onFilterChanged={onFilterChanged}
              />
            )}
            dashboardControls={() => (
              <DashboardControls dashboardId={OVERRIDES_DASHBOARD_ID} />
            )}
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            filter={filter}
            filterEditDialog={OverrideFilterDialog}
            filtersFilter={OVERRIDES_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<OverrideIcon size="large" />}
            table={
              <OverridesTable
                entities={entities}
                entitiesCounts={entitiesCounts}
                filter={filter}
                selectionType={selectionType}
                sortBy={sortBy}
                sortDir={sortDir}
                onDeleteBulk={onDeleteBulk}
                onDownloadBulk={onDownloadBulk}
                onEntityDeselected={onEntityDeselected}
                onEntitySelected={onEntitySelected}
                onFirstClick={onFirstClick}
                onLastClick={onLastClick}
                onNextClick={onNextClick}
                onOverrideCloneClick={clone}
                onOverrideDeleteClick={deleteFunc}
                onOverrideDownloadClick={download}
                onOverrideEditClick={edit}
                onPreviousClick={onPreviousClick}
                onSelectionTypeChange={onSelectionTypeChange}
                onSortChange={onSortChange}
                onTagsBulk={onTagsBulk}
              />
            }
            title={_('Overrides')}
            toolBarIcons={
              <OverrideListPageToolBarIcons onOverrideCreateClick={create} />
            }
            onError={onError}
            onFilterChanged={onFilterChanged}
            onFilterCreated={onFilterCreated}
            onFilterRemoved={onFilterRemoved}
            onFilterReset={onFilterReset}
          />
        </>
      )}
    </OverrideComponent>
  );
};

export default withEntitiesContainer<Override>('override', {
  entitiesSelector,
  loadEntities,
})(OverrideListPage);
