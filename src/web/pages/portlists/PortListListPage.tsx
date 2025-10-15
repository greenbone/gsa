/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {
  type default as Filter,
  PORTLISTS_FILTER_FILTER,
  RESET_FILTER,
} from 'gmp/models/filter';
import type PortList from 'gmp/models/portlist';
import {isDefined, hasValue} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {PortListIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import useInstanceVariable from 'web/hooks/useInstanceVariable';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useReload from 'web/hooks/useReload';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import PortListComponent from 'web/pages/portlists/PortListComponent';
import PortListsFilterDialog from 'web/pages/portlists/PortListFilterDialog';
import PortListListPageToolBarIcons from 'web/pages/portlists/PortListListPageToolBarIcons';
import PortListsTable from 'web/pages/portlists/PortListTable';
import {loadEntities, selector} from 'web/store/entities/portlists';
import {type EntitiesSelector} from 'web/store/entities/utils/selectors';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/SelectionType';

const getData = (filter: Filter, eSelector: EntitiesSelector) => {
  const entities = eSelector.getEntities(filter);
  return {
    entities,
    entitiesCounts: eSelector.getEntitiesCounts(filter),
    entitiesError: eSelector.getEntitiesError(filter),
    filter,
    isLoading: eSelector.isLoadingEntities(filter),
    loadedFilter: eSelector.getLoadedFilter(filter),
  };
};

const PortListsPage = () => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const dispatch = useDispatch();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const [downloadRef, handleDownload] = useDownload();
  const [filter, isLoadingFilter, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('portlist', 'portlist');
  const [requestedFilter, setRequestedFilter] = useInstanceVariable<
    Filter | undefined
  >(undefined);
  const portListsSelector = useShallowEqualSelector(selector);
  const listExportFileName = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).getValueByName('listexportfilename'),
  );
  const {
    selectionType,
    selected: selectedEntities = [],
    changeSelectionType,
    select,
    deselect,
  } = useSelection<PortList>();
  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );
  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  // fetch port lists
  const fetch = useCallback(
    (withFilter?: Filter) => {
      setRequestedFilter(withFilter);
      // @ts-expect-error
      dispatch(loadEntities(gmp)(withFilter));
    },
    [dispatch, gmp, setRequestedFilter],
  );

  // refetch port lists with the current filter
  const refetch = useCallback(() => {
    fetch(filter);
  }, [filter, fetch]);

  const {entities, entitiesCounts, isLoading} = getData(
    filter,
    // @ts-expect-error
    portListsSelector,
  );

  const handleFilterChanged = useCallback(
    (newFilter?: Filter) => {
      changeFilter(newFilter);
      fetch(newFilter);
    },
    [changeFilter, fetch],
  );
  const handleFilterReset = () => {
    resetFilter();
    fetch();
  };
  const handleFilterRemoved = () => {
    removeFilter();
    fetch(RESET_FILTER);
  };

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts,
    handleFilterChanged,
  );
  const timeoutFunc = useEntitiesReloadInterval(entities);
  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  useEffect(() => {
    const shouldFetch =
      isDefined(filter) &&
      !isLoadingFilter &&
      filter.identifier() !== requestedFilter?.identifier();

    if (shouldFetch) {
      fetch(filter);
    }
  }, [filter, isLoadingFilter, fetch, requestedFilter]);

  useEffect(() => {
    // start reloading if tasks are available and no timer is running yet
    if (hasValue(entities) && !hasRunningTimer) {
      startReload();
    }
  }, [entities, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  const closeTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(false);
  }, [setIsTagsDialogVisible]);

  const openTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(true);
  }, [setIsTagsDialogVisible]);

  const handleBulkDelete = useCallback(async () => {
    const entitiesCommand = gmp.portlists;
    let promise;
    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.delete(selectedEntities);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.deleteByFilter(filter);
    } else {
      promise = entitiesCommand.deleteByFilter(filter.all());
    }

    try {
      await promise;
      refetch();
    } catch (error) {
      showError(error as Error);
    }
  }, [
    selectionType,
    filter,
    selectedEntities,
    showError,
    gmp.portlists,
    refetch,
  ]);

  const handleBulkDownload = useCallback(async () => {
    const entitiesCommand = gmp.portlists;
    let promise;
    if (selectionType === SelectionType.SELECTION_USER) {
      promise = entitiesCommand.export(selectedEntities);
    } else if (selectionType === SelectionType.SELECTION_PAGE_CONTENTS) {
      promise = entitiesCommand.exportByFilter(filter);
    } else {
      promise = entitiesCommand.exportByFilter(filter.all());
    }

    try {
      const response = await promise;
      const filename = generateFilename({
        fileNameFormat: listExportFileName,
        resourceType: 'portlists',
      });
      const {data: downloadData} = response;
      handleDownload({filename, data: downloadData});
    } catch (error) {
      showError(error as Error);
    }
  }, [
    handleDownload,
    showError,
    gmp.portlists,
    filter,
    selectedEntities,
    selectionType,
    listExportFileName,
  ]);

  return (
    <PortListComponent
      onCloneError={showError}
      onCloned={refetch}
      onCreateError={showError}
      onCreated={refetch}
      onDeleteError={showError}
      onDeleted={refetch}
      onDownloadError={showError}
      onDownloaded={handleDownload}
      onImportError={showError}
      onImported={refetch}
      onSaveError={showError}
      onSaved={refetch}
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
          <Download ref={downloadRef} />
          <DialogNotification
            {...notificationDialogState}
            onCloseClick={closeNotificationDialog}
          />
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
