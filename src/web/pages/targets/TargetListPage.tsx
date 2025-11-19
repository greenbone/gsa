/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TARGETS_FILTER_FILTER} from 'gmp/models/filter';
import type Target from 'gmp/models/target';
import {TargetIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer, {
  type WithEntitiesContainerComponentProps,
} from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import TargetComponent from 'web/pages/targets/TargetComponent';
import TargetFilterDialog from 'web/pages/targets/TargetFilterDialog';
import TargetListPageToolBarIcons from 'web/pages/targets/TargetListPageToolBarIcons';
import TargetsTable from 'web/pages/targets/TargetTable';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/targets';

const TargetsPage = ({
  onChanged,
  onDownloaded,
  onError,
  filter,
  entities,
  entitiesCounts,
  isLoading,
  selectionType,
  sortDir,
  sortBy,
  onSelectionTypeChange,
  onSortChange,
  onTagsBulk,
  onFirstClick,
  onLastClick,
  onNextClick,
  onPreviousClick,
  onEntityDeselected,
  onEntitySelected,
  onDeleteBulk,
  onDownloadBulk,
  onFilterChanged,
  onFilterCreated,
  onFilterRemoved,
  onFilterReset,
}: WithEntitiesContainerComponentProps<Target>) => {
  const [_] = useTranslation();
  return (
    <TargetComponent
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
          <PageTitle title={_('Targets')} />
          <EntitiesPage<Target>
            createFilterType="target"
            entities={entities}
            entitiesCounts={entitiesCounts}
            filter={filter}
            filterEditDialog={TargetFilterDialog}
            filtersFilter={TARGETS_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<TargetIcon size="large" />}
            table={
              <TargetsTable
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
                onPreviousClick={onPreviousClick}
                onSelectionTypeChange={onSelectionTypeChange}
                onSortChange={onSortChange}
                onTagsBulk={onTagsBulk}
                onTargetCloneClick={clone}
                onTargetDeleteClick={deleteFunc}
                onTargetDownloadClick={download}
                onTargetEditClick={edit}
              />
            }
            title={_('Targets')}
            toolBarIcons={
              <TargetListPageToolBarIcons onTargetCreateClick={create} />
            }
            onError={onError}
            onFilterChanged={onFilterChanged}
            onFilterCreated={onFilterCreated}
            onFilterRemoved={onFilterRemoved}
            onFilterReset={onFilterReset}
          />
        </>
      )}
    </TargetComponent>
  );
};

export default withEntitiesContainer<Target>('target', {
  entitiesSelector,
  loadEntities,
})(TargetsPage);
