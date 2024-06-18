/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useCallback, useEffect, useState} from 'react';

import {useDispatch} from 'react-redux';

import {PORTLISTS_FILTER_FILTER} from 'gmp/models/filter';

import {isDefined, hasValue} from 'gmp/utils/identity';

import useCapabilities from 'web/utils/useCapabilities';
import useUserSessionTimeout from 'web/utils/useUserSessionTimeout';

import useGmp from 'web/utils/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useReload from 'web/hooks/useReload';
import useSelection from 'web/hooks/useSelection';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePreviousValue from 'web/hooks/usePreviousValue';
import usePagination from 'web/hooks/usePagination';
import useTranslation from 'web/hooks/useTranslation';

import PropTypes from 'web/utils/proptypes';
import SelectionType from 'web/utils/selectiontype';
import {generateFilename} from 'web/utils/render';

import {loadEntities, selector} from 'web/store/entities/portlists';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';

import useEntitiesReloadInterval from 'web/entities/useEntitiesReloadInterval';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/page';

import DialogNotification from 'web/components/notification/dialognotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';

import PageTitle from 'web/components/layout/pagetitle';
import Download from 'web/components/form/download';
import PortListIcon from 'web/components/icon/portlisticon';
import IconDivider from 'web/components/layout/icondivider';
import ManualIcon from 'web/components/icon/manualicon';
import NewIcon from 'web/components/icon/newicon';
import UploadIcon from 'web/components/icon/uploadicon';

import useDownload from 'web/components/form/useDownload';

import PortListComponent from './component';
import PortListsTable from './table';
import PortListsFilterDialog from './filterdialog';

const ToolBarIcons = ({onPortListCreateClick, onPortListImportClick}) => {
  const capabilities = useCapabilities();
  const [_] = useTranslation();
  return (
    <IconDivider>
      <ManualIcon
        page="scanning"
        anchor="creating-and-managing-port-lists"
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
    if (isDefined(filter) && !isLoadingFilter) {
      fetch(filter);
    }
  }, [filter, isLoadingFilter, fetch]);

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
      onCreated={refetch}
      onCreateError={showError}
      onSaved={refetch}
      onSaveError={showError}
      onCloned={refetch}
      onCloneError={showError}
      onDeleted={refetch}
      onDeleteError={showError}
      onDownloaded={handleDownload}
      onDownloadError={showError}
      onImported={refetch}
      onImportError={showError}
      onInteraction={renewSession}
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
            filter={filter}
            entities={entities}
            entitiesCounts={entitiesCounts}
            entitiesSelected={selectedEntities}
            sortBy={sortBy}
            sortDir={sortDir}
            filterEditDialog={PortListsFilterDialog}
            filtersFilter={PORTLISTS_FILTER_FILTER}
            isLoading={isLoading}
            sectionIcon={<PortListIcon size="large" />}
            selectionType={selectionType}
            table={PortListsTable}
            title={_('Portlists')}
            toolBarIcons={ToolBarIcons}
            onDeleteError={showError}
            onError={showError}
            onFirstClick={getFirst}
            onLastClick={getLast}
            onNextClick={getNext}
            onPreviousClick={getPrevious}
            onEntitySelected={select}
            onEntityDeselected={deselect}
            onFilterChanged={changeFilter}
            onFilterCreated={changeFilter}
            onFilterReset={resetFilter}
            onFilterRemoved={removeFilter}
            onInteraction={renewSession}
            onPortListCloneClick={clone}
            onPortListCreateClick={create}
            onPortListDeleteClick={delete_func}
            onPortListDownloadClick={download}
            onPortListEditClick={edit}
            onPortListSaveClick={save}
            onPortListImportClick={import_func}
            onSelectionTypeChange={changeSelectionType}
            onSortChange={handleSortChange}
            onDeleteBulk={handleBulkDelete}
            onDownloadBulk={handleBulkDownload}
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
              selected={selectedEntities}
              filter={filter}
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
