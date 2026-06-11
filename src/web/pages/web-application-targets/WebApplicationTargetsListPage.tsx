/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type default as Filter, TARGETS_FILTER_FILTER} from 'gmp/models/filter';
import type WebApplicationTarget from 'gmp/models/web-application-target';
import {getEntityType, pluralizeType} from 'gmp/utils/entity-type';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {NewIcon, TargetIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import {
  useGetWebApplicationTargets,
  useBulkDeleteWebApplicationTargets,
  useBulkExportWebApplicationTargets,
} from 'web/hooks/use-query/web-application-targets';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import WebApplicationTargetFilterDialog from 'web/pages/web-application-targets/WebApplicationTargetFilterDialog';
import WebApplicationTargetsComponent from 'web/pages/web-application-targets/WebApplicationTargetsComponent';
import WebApplicationTargetTable from 'web/pages/web-application-targets/WebApplicationTargetTable';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/SelectionType';

const WebApplicationTargetsListPageToolBarIcons = ({
  onWebApplicationTargetCreateClick,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-web-application-targets"
        page="scanning"
        title={_('Help: Web Application Targets')}
      />
      {capabilities.mayAccess('webapplicationtarget') &&
        features.featureEnabled('ENABLE_WEB_APPLICATION_SCANNING') && (
          <NewIcon
            title={_('New Web Application Target')}
            onClick={onWebApplicationTargetCreateClick}
          />
        )}
    </IconDivider>
  );
};

const WebApplicationTargetsListPage = () => {
  const [_] = useTranslation();

  const [downloadRef, handleDownload] = useDownload();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const deleteFuncRef = useRef<
    ((target: WebApplicationTarget) => Promise<void> | void) | null
  >(null);

  const listExportFileName = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).getValueByName('listexportfilename'),
  );

  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const [filter, isFilterLoading, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('web_application_targets', 'web_application_targets');

  const {
    data: webApplicationTargetsData,
    isLoading: isDataLoading,
    isPending: isUpdating,
    error,
    isError,
  } = useGetWebApplicationTargets({filter});

  const allEntities = useMemo(
    () => webApplicationTargetsData?.entities ?? [],
    [webApplicationTargetsData],
  );
  const entitiesCounts = webApplicationTargetsData?.entitiesCounts;

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );

  const {
    selectionType,
    selected: selectedEntities = [],
    changeSelectionType,
    select,
    deselect,
  } = useSelection<WebApplicationTarget>();

  const bulkDelete = useBulkDeleteWebApplicationTargets({
    onError: showError,
  });

  const bulkExport = useBulkExportWebApplicationTargets({
    onError: showError,
  });

  const handleBulkDelete = useCallback(async () => {
    let input: WebApplicationTarget[] | Filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      input = selectedEntities;
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      input = filter.all();
    } else {
      input = allEntities ?? [];
    }

    try {
      await bulkDelete.mutateAsync(input);
    } catch (error) {
      showError(error as Error);
    }
  }, [
    selectionType,
    selectedEntities,
    filter,
    allEntities,
    bulkDelete,
    showError,
  ]);

  const handleBulkDownload = useCallback(async () => {
    let input: WebApplicationTarget[] | Filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      input = selectedEntities;
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      input = filter.all();
    } else {
      input = allEntities ?? [];
    }

    try {
      showSuccessNotification('', _('Bulk download started.'));
      const response = await bulkExport.mutateAsync(input);
      const filename = generateFilename({
        fileNameFormat: listExportFileName,
        resourceType: pluralizeType(getEntityType(allEntities[0])),
      });
      const {data} = response;
      handleDownload({filename, data});
      showSuccessNotification('', _('Bulk download completed.'));
    } catch (error) {
      showError(error as Error);
    }
  }, [
    selectionType,
    selectedEntities,
    filter,
    allEntities,
    bulkExport,
    showError,
    handleDownload,
    listExportFileName,
    _,
  ]);

  const handleFilterChanged = useCallback(
    (newFilter?: Filter) => {
      changeFilter(newFilter);
    },
    [changeFilter],
  );

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts as CollectionCounts,
    handleFilterChanged,
  );

  const closeTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(false);
  }, [setIsTagsDialogVisible]);

  const openTagsDialog = useCallback(() => {
    setIsTagsDialogVisible(true);
  }, [setIsTagsDialogVisible]);

  const handleFilterReset = useCallback(() => {
    resetFilter();
  }, [resetFilter]);

  const handleFilterRemoved = useCallback(() => {
    removeFilter();
  }, [removeFilter]);

  const handleIndividualDelete = useCallback(
    async (target: WebApplicationTarget) => {
      if (!target.id) return;
      try {
        const df = deleteFuncRef.current;
        if (!df) return;
        await df(target);
      } catch (error) {
        showError(error as Error);
      }
    },
    [showError],
  );

  const openConfirmDeleteDialog = useCallback(
    (target: WebApplicationTarget) => {
      void handleIndividualDelete(target);
    },
    [handleIndividualDelete],
  );

  const isLoading = isFilterLoading || isDataLoading;

  return (
    <WebApplicationTargetsComponent
      onCloneError={showError}
      onDeleteError={showError}
      onDownloadError={showError}
      onDownloaded={handleDownload}
      onSaveError={showError}
    >
      {({clone, create, delete: deleteFunc, download, edit}) => {
        deleteFuncRef.current = deleteFunc;

        return (
          <>
            <PageTitle title={_('Web Application Targets')} />
            <EntitiesPage
              createFilterType="target"
              entities={allEntities}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={WebApplicationTargetFilterDialog}
              filtersFilter={TARGETS_FILTER_FILTER}
              isLoading={isLoading}
              isUpdating={isUpdating}
              sectionIcon={<TargetIcon size="large" />}
              table={
                <WebApplicationTargetTable
                  entities={allEntities}
                  entitiesCounts={entitiesCounts}
                  filter={filter}
                  isUpdating={isUpdating}
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
                  onPreviousClick={getPrevious}
                  onSelectionTypeChange={changeSelectionType}
                  onSortChange={handleSortChange}
                  onTagsBulk={openTagsDialog}
                  onWebApplicationTargetCloneClick={clone}
                  onWebApplicationTargetDeleteClick={openConfirmDeleteDialog}
                  onWebApplicationTargetDownloadClick={download}
                  onWebApplicationTargetEditClick={edit}
                />
              }
              title={_('Web Application Targets')}
              toolBarIcons={
                <WebApplicationTargetsListPageToolBarIcons
                  onWebApplicationTargetCreateClick={create}
                />
              }
              onDeleteBulk={handleBulkDelete}
              onDownloadBulk={handleBulkDownload}
              onError={() => {}}
              onFilterChanged={handleFilterChanged}
              onFilterCreated={handleFilterChanged}
              onFilterRemoved={handleFilterRemoved}
              onFilterReset={handleFilterReset}
              onTagsBulk={openTagsDialog}
            />
            <Download ref={downloadRef} />
            <DialogNotification
              {...notificationDialogState}
              onCloseClick={closeNotificationDialog}
            />
            {isTagsDialogVisible && (
              <BulkTags
                entities={allEntities}
                entitiesCounts={entitiesCounts as CollectionCounts}
                filter={filter}
                selectedEntities={selectedEntities}
                selectionType={selectionType}
                onClose={closeTagsDialog}
              />
            )}
          </>
        );
      }}
    </WebApplicationTargetsComponent>
  );
};

export default WebApplicationTargetsListPage;
