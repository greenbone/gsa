/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useState} from 'react';
import {ExistingSettings} from 'gmp/commands/user';
import {type FilterType, PORTLISTS_FILTER_FILTER} from 'gmp/models/filter';
import type PortList from 'gmp/models/port-list';
import useDownload from 'web/components/form/useDownload';
import {PortListIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import useEntitiesRefetchInterval from 'web/entities/useEntitiesRefetchInterval';
import {
  useBulkDeletePortLists,
  useBulkExportPortLists,
  useGetPortLists,
} from 'web/hooks/use-query/port-lists';
import {useGetUserSetting} from 'web/hooks/use-query/user';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useTranslation from 'web/hooks/useTranslation';
import PortListComponent from 'web/pages/portlists/PortListComponent';
import PortListsFilterDialog from 'web/pages/portlists/PortListFilterDialog';
import PortListListPageToolBarIcons from 'web/pages/portlists/PortListListPageToolBarIcons';
import PortListsTable from 'web/pages/portlists/PortListTable';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/selection-type';

const PortListsPage = () => {
  const [_] = useTranslation();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const {downloadComponent, download: handleDownload} = useDownload();
  const [filter, , {changeFilter, resetFilter, removeFilter}] = usePageFilter(
    'portlist',
    'portlist',
  );
  const {
    selectionType,
    selected: selectedEntities,
    changeSelectionType,
    select,
    deselect,
  } = useSelection<PortList>();
  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );
  const {dialogNotification, showError} = useDialogNotification();

  const portListBulkDeleteMutation = useBulkDeletePortLists({
    onError: showError,
  });
  const portListBulkExportMutation = useBulkExportPortLists({
    onError: showError,
  });
  const getUserSettingQuery = useGetUserSetting();

  const reloadIntervalFunc = useEntitiesRefetchInterval();
  const {
    data,
    error: entitiesError,
    isLoading,
  } = useGetPortLists({
    filter: filter,
    refetchInterval: data => reloadIntervalFunc(data?.entities),
  });
  const {entities, entitiesCounts} = data ?? {};

  const handleFilterChanged = useCallback(
    (newFilter?: FilterType) => {
      changeFilter(newFilter);
    },
    [changeFilter],
  );
  const handleFilterReset = () => {
    resetFilter();
  };
  const handleFilterRemoved = () => {
    removeFilter();
  };

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts,
    handleFilterChanged,
  );

  const closeTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(false);
  }, [setIsTagsDialogVisible]);

  const openTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(true);
  }, [setIsTagsDialogVisible]);

  const handleBulkDelete = useCallback(async () => {
    if (selectionType === SelectionType.SELECTION_USER) {
      await portListBulkDeleteMutation.mutateAsync(selectedEntities);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      await portListBulkDeleteMutation.mutateAsync(filter);
    } else {
      await portListBulkDeleteMutation.mutateAsync(filter.all());
    }
  }, [selectionType, filter, selectedEntities, portListBulkDeleteMutation]);

  const handleBulkDownload = useCallback(async () => {
    let promise: Promise<string>;
    if (selectionType === SelectionType.SELECTION_USER) {
      promise = portListBulkExportMutation.mutateAsync(selectedEntities);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = portListBulkExportMutation.mutateAsync(filter);
    } else {
      promise = portListBulkExportMutation.mutateAsync(filter.all());
    }

    const [downloadData, listExportFileNameSetting] = await Promise.all([
      promise,
      getUserSettingQuery(ExistingSettings.listexportfilename),
    ]);
    const filename = generateFilename({
      fileNameFormat: listExportFileNameSetting?.value as string,
      resourceType: 'portlists',
    });
    handleDownload({filename, data: downloadData});
  }, [
    handleDownload,
    filter,
    selectedEntities,
    selectionType,
    getUserSettingQuery,
    portListBulkExportMutation,
  ]);

  return (
    <PortListComponent
      onCloneError={showError}
      onCreateError={showError}
      onDeleteError={showError}
      onDownloadError={showError}
      onDownloaded={handleDownload}
      onImportError={showError}
      onSaveError={showError}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        edit,
        import: importFunc,
      }) => (
        <>
          <PageTitle title={_('Port Lists')} />
          <EntitiesPage<PortList>
            createFilterType="portlist"
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesError={entitiesError}
            filter={filter}
            filterEditDialog={PortListsFilterDialog}
            filtersFilter={PORTLISTS_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<PortListIcon size="large" />}
            table={
              <PortListsTable
                entities={entities}
                entitiesCounts={entitiesCounts}
                filter={filter}
                selectionType={selectionType}
                sortBy={sortBy}
                sortDir={sortDir}
                onDeleteBulk={handleBulkDelete}
                onDownloadBulk={handleBulkDownload}
                onEntityDeselected={deselect}
                onEntitySelected={select}
                onFirstClick={getFirst}
                onLastClick={getLast}
                onNextClick={getNext}
                onPortListCloneClick={clone}
                onPortListDeleteClick={deleteFunc}
                onPortListDownloadClick={download}
                onPortListEditClick={edit}
                onPreviousClick={getPrevious}
                onSelectionTypeChange={changeSelectionType}
                onSortChange={handleSortChange}
                onTagsBulk={openTagsDialog}
              />
            }
            title={_('Port Lists')}
            toolBarIcons={
              <PortListListPageToolBarIcons
                onPortListCreateClick={create}
                onPortListImportClick={importFunc}
              />
            }
            onError={showError}
            onFilterChanged={handleFilterChanged}
            onFilterCreated={handleFilterChanged}
            onFilterRemoved={handleFilterRemoved}
            onFilterReset={handleFilterReset}
          />
          {downloadComponent}
          {dialogNotification}
          {isTagsDialogVisible && (
            <BulkTags
              entities={entities}
              entitiesCounts={entitiesCounts}
              filter={filter}
              selectedEntities={selectedEntities}
              selectionType={selectionType}
              onClose={closeTagsDialog}
            />
          )}
        </>
      )}
    </PortListComponent>
  );
};

export default PortListsPage;
