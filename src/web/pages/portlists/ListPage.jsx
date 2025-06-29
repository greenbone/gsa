/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {PORTLISTS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined, hasValue} from 'gmp/utils/identity';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {NewIcon, PortListIcon, UploadIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/Page';
import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import useCapabilities from 'web/hooks/useCapabilities';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import usePreviousValue from 'web/hooks/usePreviousValue';
import useReload from 'web/hooks/useReload';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import PortListsFilterDialog from 'web/pages/portlists/FilterDialog';
import PortListComponent from 'web/pages/portlists/PortListComponent';
import PortListsTable from 'web/pages/portlists/Table';
import {loadEntities, selector} from 'web/store/entities/portlists';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import PropTypes from 'web/utils/PropTypes';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/SelectionType';

const ToolBarIcons = ({onPortListCreateClick, onPortListImportClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        anchor="creating-and-managing-port-lists"
        page="scanning"
        title={_('Help: Port Lists')}
      />
      {capabilities.mayCreate('port_list') && (
        <NewIcon title={_('New Port List')} onClick={onPortListCreateClick} />
      )}
      <UploadIcon
        title={_('Import Port List')}
        onClick={onPortListImportClick}
      />
    </IconDivider>
  );
};

ToolBarIcons.propTypes = {
  onPortListCreateClick: PropTypes.func.isRequired,
  onPortListImportClick: PropTypes.func.isRequired,
};

const getData = (filter, eSelector) => {
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
  const [, renewSession] = useUserSessionTimeout();
  const [filter, isLoadingFilter, changeFilter, resetFilter, removeFilter] =
    usePageFilter('portlist');
  const previousFilter = usePreviousValue(filter);
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
  } = useSelection();
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
    withFilter => {
      dispatch(loadEntities(gmp)(withFilter));
    },
    [dispatch, gmp],
  );

  // refetch port lists with the current filter
  const refetch = useCallback(() => {
    fetch(filter);
  }, [filter, fetch]);

  const {entities, entitiesCounts, isLoading} = getData(
    filter,
    portListsSelector,
  );

  const paginationChanged = useCallback(
    newFilter => {
      fetch(newFilter);
      changeFilter(newFilter);
    },
    [changeFilter, fetch],
  );

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts,
    paginationChanged,
  );
  const timeoutFunc = useEntitiesReloadInterval(entities);
  const [startReload, stopReload, hasRunningTimer] = useReload(
    refetch,
    timeoutFunc,
  );

  useEffect(() => {
    // load initial data
    if (
      isDefined(filter) &&
      !isLoadingFilter &&
      !filter.equals(previousFilter)
    ) {
      fetch(filter);
    }
  }, [filter, isLoadingFilter, fetch, previousFilter]);

  useEffect(() => {
    // reload if filter has changed
    if (!filter.equals(previousFilter)) {
      fetch(filter);
    }
  }, [filter, previousFilter, fetch]);

  useEffect(() => {
    // start reloading if tasks are available and no timer is running yet
    if (hasValue(entities) && !hasRunningTimer) {
      startReload();
    }
  }, [entities, startReload]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop reload on unmount
  useEffect(() => stopReload, [stopReload]);

  const closeTagsDialog = useCallback(() => {
    renewSession();
    setIsTagsDialogVisible(false);
  }, [renewSession, setIsTagsDialogVisible]);

  const openTagsDialog = useCallback(() => {
    renewSession();
    setIsTagsDialogVisible(true);
  }, [renewSession, setIsTagsDialogVisible]);

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

    renewSession();

    try {
      await promise;
      refetch();
    } catch (error) {
      showError(error);
    }
  }, [
    selectionType,
    filter,
    selectedEntities,
    showError,
    gmp.portlists,
    refetch,
    renewSession,
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

    renewSession();

    try {
      const response = await promise;
      const filename = generateFilename({
        fileNameFormat: listExportFileName,
        resourceType: 'portlists',
      });
      const {data: downloadData} = response;
      handleDownload({filename, data: downloadData});
    } catch (error) {
      showError(error);
    }
  }, [
    renewSession,
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
      onInteraction={renewSession}
      onSaveError={showError}
      onSaved={refetch}
    >
      {({
        clone,
        create,
        delete: delete_func,
        download,
        edit,
        save,
        import: import_func,
      }) => (
        <>
          <PageTitle title={_('Portlists')} />
          <EntitiesPage
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesSelected={selectedEntities}
            filter={filter}
            filterEditDialog={PortListsFilterDialog}
            filtersFilter={PORTLISTS_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<PortListIcon size="large" />}
            selectionType={selectionType}
            sortBy={sortBy}
            sortDir={sortDir}
            table={PortListsTable}
            title={_('Portlists')}
            toolBarIcons={ToolBarIcons}
            onDeleteBulk={handleBulkDelete}
            onDeleteError={showError}
            onDownloadBulk={handleBulkDownload}
            onEntityDeselected={deselect}
            onEntitySelected={select}
            onError={showError}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterRemoved={removeFilter}
            onFilterReset={resetFilter}
            onFirstClick={getFirst}
            onInteraction={renewSession}
            onLastClick={getLast}
            onNextClick={getNext}
            onPortListCloneClick={clone}
            onPortListCreateClick={create}
            onPortListDeleteClick={delete_func}
            onPortListDownloadClick={download}
            onPortListEditClick={edit}
            onPortListImportClick={import_func}
            onPortListSaveClick={save}
            onPreviousClick={getPrevious}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
            onTagsBulk={openTagsDialog}
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
