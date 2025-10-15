/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import type CollectionCounts from 'gmp/collection/CollectionCounts';
import type AgentGroup from 'gmp/models/agentgroup';
import {
  type default as Filter,
  AGENT_GROUPS_FILTER_FILTER,
} from 'gmp/models/filter';
import {HatAndGlassesIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import {useGetAgentGroups} from 'web/hooks/useQuery/agentgroups';
import useSelection from 'web/hooks/useSelection';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';
import AgentGroupsFilterDialog from 'web/pages/agent-groups/AgentGroupsFilterDialog';
import AgentGroupsListPageToolBarIcons from 'web/pages/agent-groups/AgentGroupsListPageToolBarIcons';
import AgentGroupsTable from 'web/pages/agent-groups/AgentGroupsTable';
import SelectionType from 'web/utils/SelectionType';

const AgentGroupsListPage = () => {
  const [_] = useTranslation();

  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const deleteFuncRef = useRef<
    ((agentGroup: AgentGroup) => Promise<void> | void) | null
  >(null);

  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const [filter, isFilterLoading, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('agent_groups', 'agent_groups');

  const {
    data: agentGroupsData,
    isLoading: isDataLoading,
    isPending: isUpdating,
    error,
    isError,
    refetch,
  } = useGetAgentGroups({filter});

  const allEntities = useMemo(
    () => agentGroupsData?.entities ?? [],
    [agentGroupsData],
  );
  const entitiesCounts = agentGroupsData?.entitiesCounts;

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
  } = useSelection<AgentGroup>();

  const handleBulkDelete = useCallback(async () => {
    try {
      const df = deleteFuncRef.current;
      if (!df) return;

      const source =
        selectionType === SelectionType.SELECTION_USER
          ? selectedEntities
          : allEntities;

      if (source.length === 0) return;

      await Promise.all(source.map(e => df(e)));
    } catch (error) {
      showError(error as Error);
    }
  }, [selectionType, selectedEntities, allEntities, showError]);

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
    async (agentGroup: AgentGroup) => {
      if (!agentGroup.id) return;
      try {
        const df = deleteFuncRef.current;
        if (!df) return;
        await df(agentGroup);
      } catch (error) {
        showError(error as Error);
      }
    },
    [showError],
  );

  const openConfirmDeleteDialog = useCallback(
    (agentGroup: AgentGroup) => {
      void handleIndividualDelete(agentGroup);
    },
    [handleIndividualDelete],
  );

  const isLoading = isFilterLoading || isDataLoading;
  return (
    <AgentGroupsComponent
      // wire one-shot refreshes via callbacks
      onCloneError={showError}
      onCloned={() => {
        void refetch();
      }}
      onCreated={() => {
        void refetch();
      }}
      onDeleteError={showError}
      onDeleted={() => {
        void refetch();
      }}
      onSaveError={showError}
      onSaved={() => {
        void refetch();
      }}
    >
      {({create, clone, delete: deleteFunc, edit}) => {
        deleteFuncRef.current = deleteFunc;

        return (
          <>
            <PageTitle title={_('Agent Group')} />
            <EntitiesPage
              createFilterType="agentgroup"
              entities={allEntities}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={AgentGroupsFilterDialog}
              filtersFilter={AGENT_GROUPS_FILTER_FILTER}
              isLoading={isLoading}
              isUpdating={isUpdating}
              sectionIcon={<HatAndGlassesIcon size="large" />}
              table={
                <>
                  <AgentGroupsTable
                    entities={allEntities}
                    entitiesCounts={entitiesCounts}
                    filter={filter}
                    selectionType={selectionType}
                    sortBy={sortBy}
                    sortDir={sortDir}
                    onAgentGroupCloneClick={clone}
                    onAgentGroupDeleteClick={openConfirmDeleteDialog}
                    onAgentGroupEditClick={edit}
                    onDeleteBulk={handleBulkDelete}
                    onEntityDeselected={deselect}
                    onEntitySelected={select}
                    onFirstClick={getFirst}
                    onLastClick={getLast}
                    onNextClick={getNext}
                    onPreviousClick={getPrevious}
                    onSelectionTypeChange={changeSelectionType}
                    onSortChange={handleSortChange}
                    onTagsBulk={openTagsDialog}
                  />
                </>
              }
              title={_('Agent Groups')}
              toolBarIcons={
                <AgentGroupsListPageToolBarIcons onAgentCreateClick={create} />
              }
              onAgentEditClick={edit}
              onError={() => {}}
              onFilterChanged={handleFilterChanged}
              onFilterCreated={handleFilterChanged}
              onFilterRemoved={handleFilterRemoved}
              onFilterReset={handleFilterReset}
            />
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
    </AgentGroupsComponent>
  );
};

export default AgentGroupsListPage;
