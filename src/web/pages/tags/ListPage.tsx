/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import {showSuccessNotification} from '@greenbone/ui-lib';
import type CollectionCounts from 'gmp/collection/collection-counts';
import {type default as Filter, TAGS_FILTER_FILTER} from 'gmp/models/filter';
import type Tag from 'gmp/models/tag';
import {getEntityType, pluralizeType} from 'gmp/utils/entity-type';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {NewIcon, TagIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import IconDivider from 'web/components/layout/IconDivider';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import {
  useGetTags,
  useBulkDeleteTags,
  useBulkExportTags,
} from 'web/hooks/use-query/tags';
import useCapabilities from 'web/hooks/useCapabilities';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import TagsTable from 'web/pages/tags/Table';
import TagComponent from 'web/pages/tags/TagComponent';
import TagFilterDialog from 'web/pages/tags/TagFilterDialog';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import {generateFilename} from 'web/utils/Render';
import SelectionType from 'web/utils/SelectionType';

interface ToolBarIconsProps {
  onTagCreateClick: () => void;
}

const ToolBarIcons = ({onTagCreateClick}: ToolBarIconsProps) => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  return (
    <IconDivider>
      <ManualIcon
        anchor="managing-tags"
        page="web-interface"
        title={_('Help: Tags')}
      />
      {capabilities.mayCreate('tag') && (
        <NewIcon title={_('New Tag')} onClick={onTagCreateClick} />
      )}
    </IconDivider>
  );
};

const TagsPage = () => {
  const [_] = useTranslation();

  const [downloadRef, handleDownload] = useDownload();
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const deleteFuncRef = useRef<((tag: Tag) => Promise<void> | void) | null>(
    null,
  );

  const listExportFileName = useShallowEqualSelector(state =>
    getUserSettingsDefaults(state).getValueByName('listexportfilename'),
  );

  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const [filter, isFilterLoading, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('tag', 'tags');

  const {
    data: tagsData,
    isLoading: isDataLoading,
    isPending: isUpdating,
    error,
    isError,
  } = useGetTags({filter});

  const allEntities = useMemo(() => tagsData?.entities ?? [], [tagsData]);
  const entitiesCounts = tagsData?.entitiesCounts;

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
  } = useSelection<Tag>();

  const bulkDelete = useBulkDeleteTags({
    onError: showError,
  });

  const bulkExport = useBulkExportTags({
    onError: showError,
  });

  const handleBulkDelete = useCallback(async () => {
    let input: Tag[] | Filter;
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
    let input: Tag[] | Filter;
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
    async (tag: Tag) => {
      if (!tag.id) return;
      try {
        const df = deleteFuncRef.current;
        if (!df) return;
        await df(tag);
      } catch (error) {
        showError(error as Error);
      }
    },
    [showError],
  );

  const openConfirmDeleteDialog = useCallback(
    (tag: Tag) => {
      void handleIndividualDelete(tag);
    },
    [handleIndividualDelete],
  );

  const isLoading = isFilterLoading || isDataLoading;

  return (
    <TagComponent
      onCloneError={showError}
      onDeleteError={showError}
      onDisableError={showError}
      onDownloadError={showError}
      onDownloaded={handleDownload}
      onEnableError={showError}
      onSaveError={showError}
    >
      {({
        clone,
        create,
        delete: deleteFunc,
        download,
        edit,
        enable,
        disable,
      }) => {
        deleteFuncRef.current = deleteFunc;

        return (
          <>
            <PageTitle title={_('Tags')} />
            <EntitiesPage
              createFilterType="tag"
              entities={allEntities}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={TagFilterDialog}
              filtersFilter={TAGS_FILTER_FILTER}
              isLoading={isLoading}
              isUpdating={isUpdating}
              sectionIcon={<TagIcon size="large" />}
              table={
                <TagsTable
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
                  onTagCloneClick={clone}
                  onTagDeleteClick={openConfirmDeleteDialog}
                  onTagDisableClick={disable}
                  onTagDownloadClick={download}
                  onTagEditClick={edit}
                  onTagEnableClick={enable}
                  onTagsBulk={openTagsDialog}
                />
              }
              tags={false}
              title={_('Tags')}
              toolBarIcons={<ToolBarIcons onTagCreateClick={create} />}
              onError={() => {}}
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
    </TagComponent>
  );
};

export default TagsPage;
