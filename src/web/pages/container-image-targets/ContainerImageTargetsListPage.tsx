/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type default as Filter, TARGETS_FILTER_FILTER} from 'gmp/models/filter';
import type OciImageTarget from 'gmp/models/oci-image-target';
import {getEntityType, pluralizeType} from 'gmp/utils/entitytype';
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
  useGetOciImageTargets,
  useBulkDeleteOciImageTargets,
  useBulkExportOciImageTargets,
} from 'web/hooks/use-query/oci-image-targets';
import useCapabilities from 'web/hooks/useCapabilities';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import ContainerImageTargetFilterDialog from 'web/pages/container-image-targets/ContainerImageTargetFilterDialog';
import ContainerImageTargetsComponent from 'web/pages/container-image-targets/ContainerImageTargetsComponent';
import ContainerImageTargetTable from 'web/pages/container-image-targets/ContainerImageTargetTable';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/SelectionType';

const ContainerImageTargetsListPageToolBarIcons = ({
  onContainerImageTargetCreateClick,
}) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-container-image-targets"
        page="scanning"
        title={_('Help: Container Image Targets')}
      />
      {capabilities.mayCreate('ociimagetarget') && (
        <NewIcon
          title={_('New Container Image Target')}
          onClick={onContainerImageTargetCreateClick}
        />
      )}
    </IconDivider>
  );
};

const ContainerImageTargetsListPage = () => {
  const [_] = useTranslation();

  const [downloadRef, handleDownload] = useDownload();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const deleteFuncRef = useRef<
    ((ociImageTarget: OciImageTarget) => Promise<void> | void) | null
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
    usePageFilter('oci_image_targets', 'container_image_targets');

  const {
    data: ociImageTargetsData,
    isLoading: isDataLoading,
    isPending: isUpdating,
    error,
    isError,
  } = useGetOciImageTargets({filter});

  const allEntities = useMemo(
    () => ociImageTargetsData?.entities ?? [],
    [ociImageTargetsData],
  );
  const entitiesCounts = ociImageTargetsData?.entitiesCounts;

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
  } = useSelection<OciImageTarget>();

  const bulkDelete = useBulkDeleteOciImageTargets({
    onError: showError,
  });

  const bulkExport = useBulkExportOciImageTargets({
    onError: showError,
  });

  const handleBulkDelete = useCallback(async () => {
    let input: OciImageTarget[] | Filter;
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
    let input: OciImageTarget[] | Filter;
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
    async (target: OciImageTarget) => {
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
    (target: OciImageTarget) => {
      void handleIndividualDelete(target);
    },
    [handleIndividualDelete],
  );

  const isLoading = isFilterLoading || isDataLoading;

  return (
    <ContainerImageTargetsComponent
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
            <PageTitle title={_('Container Image Targets')} />
            <EntitiesPage
              createFilterType="target"
              entities={allEntities}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={ContainerImageTargetFilterDialog}
              filtersFilter={TARGETS_FILTER_FILTER}
              isLoading={isLoading}
              isUpdating={isUpdating}
              sectionIcon={<TargetIcon size="large" />}
              table={
                <ContainerImageTargetTable
                  entities={allEntities}
                  entitiesCounts={entitiesCounts}
                  filter={filter}
                  isUpdating={isUpdating}
                  selectionType={selectionType}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onContainerImageTargeEditClick={edit}
                  onContainerImageTargetCloneClick={clone}
                  onContainerImageTargetDeleteClick={openConfirmDeleteDialog}
                  onContainerImageTargetDownloadClick={download}
                  onDeleteBulk={handleBulkDelete}
                  onDownloadBulk={handleBulkDownload}
                  onEntityDeselected={deselect}
                  onEntitySelected={select}
                  onSelectionTypeChange={changeSelectionType}
                  onSortChange={handleSortChange}
                  onTagsBulk={openTagsDialog}
                />
              }
              title={_('Container Image Targets')}
              toolBarIcons={
                <ContainerImageTargetsListPageToolBarIcons
                  onContainerImageTargetCreateClick={create}
                />
              }
              onDeleteBulk={handleBulkDelete}
              onDownloadBulk={handleBulkDownload}
              onError={() => {}}
              onFilterChanged={handleFilterChanged}
              onFilterCreated={handleFilterChanged}
              onFilterRemoved={handleFilterRemoved}
              onFilterReset={handleFilterReset}
              onFirstClick={getFirst}
              onLastClick={getLast}
              onNextClick={getNext}
              onPreviousClick={getPrevious}
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
    </ContainerImageTargetsComponent>
  );
};

export default ContainerImageTargetsListPage;
