/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import AgentGroup from 'gmp/models/agent-groups';
import Filter, {AGENT_GROUPS_FILTER_FILTER} from 'gmp/models/filter';
import {HatAndGlassesIcon} from 'web/components/icon';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import BulkTags from 'web/entities/BulkTags';
import EntitiesPage from 'web/entities/EntitiesPage';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import {useGetAgentGroups} from 'web/hooks/useQuery/agent-groups';
import useSelection from 'web/hooks/useSelection';
import useShallowEqualSelector from 'web/hooks/useShallowEqualSelector';
import useTranslation from 'web/hooks/useTranslation';
import AgentGroupsComponent from 'web/pages/agent-groups/AgentGroupsComponent';
import AgentGroupsFilterDialog from 'web/pages/agent-groups/AgentGroupsFilterDialog';
import AgentGroupsListPageToolBarIcons from 'web/pages/agent-groups/AgentGroupsListPageToolBarIcons';
import AgentGroupsTable from 'web/pages/agent-groups/AgentGroupsTable';
import {getUserSettingsDefaults} from 'web/store/usersettings/defaults/selectors';
import SelectionType from 'web/utils/SelectionType';

const AgentGroupsListPage = () => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const deleteFuncRef = useRef<
    ((agentGroup: AgentGroup) => Promise<unknown>) | null
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
    error,
    isError,
  } = useGetAgentGroups({filter});

  const allEntities = useMemo(
    () => (agentGroupsData as {entities?: AgentGroup[]})?.entities || [],
    [agentGroupsData],
  );

  const entitiesCounts = (
    agentGroupsData as {entitiesCounts?: CollectionCounts}
  )?.entitiesCounts;

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
    // @ts-expect-error
    const entitiesCommand = gmp.agentgroups;
    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      const agentGroups = selectedEntities
        .filter(entity => entity.id !== null && entity.id !== undefined)
        .map(entity => ({id: entity.id as string}));
      promise = entitiesCommand.deleteAgentGroups(agentGroups);
    } else {
      const agentGroups = allEntities
        .filter(entity => entity.id !== null && entity.id !== undefined)
        .map(entity => ({id: entity.id as string}));
      promise = entitiesCommand.deleteAgentGroups(agentGroups);
    }

    try {
      await promise;
    } catch (error) {
      showError(error as Error);
    }
  }, [
    selectionType,
    selectedEntities,
    allEntities,
    // @ts-expect-error
    gmp.agentgroups,
    showError,
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
    async (agentGroup: AgentGroup) => {
      if (!agentGroup.id) {
        return;
      }

      try {
        // @ts-expect-error
        const entitiesCommand = gmp.agentgroups;
        await entitiesCommand.deleteAgentGroups([{id: agentGroup.id}]);
      } catch (error) {
        showError(error as Error);
      }
    },
    [
      // @ts-expect-error
      gmp.agentgroups,
      showError,
    ],
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
      onCloneError={showError}
      onDeleteError={showError}
      onSaveError={showError}
    >
      {({create, clone, delete: deleteFunc, edit}) => {
        deleteFuncRef.current = deleteFunc;

        return (
          <>
            <PageTitle title={_('Agent Group')} />
            <EntitiesPage
              createFilterType="agent_group"
              entities={allEntities}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={AgentGroupsFilterDialog}
              filtersFilter={AGENT_GROUPS_FILTER_FILTER}
              isLoading={isLoading}
              sectionIcon={<HatAndGlassesIcon size="large" />}
              table={
                <>
                  <AgentGroupsTable
                    entities={allEntities}
                    entitiesCounts={entitiesCounts}
                    filter={filter}
                    // @ts-expect-error
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
