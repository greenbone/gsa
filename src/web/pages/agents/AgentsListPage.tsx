/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useMemo, useRef, useState} from 'react';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Agent from 'gmp/models/agents';
import Filter, {AGENTS_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';
import {DELETE_ACTION} from 'web/components/dialog/DialogTwoButtonFooter';
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
import {useGetAgents} from 'web/hooks/useQuery/agents';
import useSelection from 'web/hooks/useSelection';
import useTranslation from 'web/hooks/useTranslation';
import AgentComponent from 'web/pages/agents/AgentComponent';
import AgentListPageToolBarIcons from 'web/pages/agents/AgentListPageToolBarIcons';
import AgentsFilterDialog from 'web/pages/agents/AgentsFilterDialog';
import AgentsTable from 'web/pages/agents/AgentsTable';
import AgentsDashboard, {AGENTS_DASHBOARD_ID} from 'web/pages/agents/dashboard';
import SelectionType from 'web/utils/SelectionType';

const AgentListPage = () => {
  const [_] = useTranslation();
  const gmp = useGmp();

  const [confirmDeleteDialogVisible, setConfirmDeleteDialogVisible] =
    useState(false);
  const [deleteAgent, setDeleteAgent] = useState<Agent | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const deleteFuncRef = useRef<((agent: Agent) => Promise<unknown>) | null>(
    null,
  );

  const {
    dialogState: notificationDialogState,
    closeDialog: closeNotificationDialog,
    showError,
  } = useDialogNotification();

  const [filter, isFilterLoading, {changeFilter, resetFilter, removeFilter}] =
    usePageFilter('agents', 'agents');

  const {
    data: agentsData,
    isLoading: isDataLoading,
    refetch,
    error,
    isError,
  } = useGetAgents({filter});

  const allEntities = useMemo(
    () => (agentsData as {entities?: Agent[]})?.entities || [],
    [agentsData],
  );

  const entitiesCounts = (agentsData as {entitiesCounts?: CollectionCounts})
    ?.entitiesCounts;

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
  } = useSelection<Agent>();

  const handleBulkDelete = useCallback(async () => {
    // @ts-expect-error
    const entitiesCommand = gmp.agents;
    let promise;

    if (selectionType === SelectionType.SELECTION_USER) {
      const agents = selectedEntities.filter(
        entity => entity.id !== null && entity.id !== undefined,
      );
      promise = entitiesCommand.delete(agents);
    } else {
      const agents = allEntities.filter(
        entity => entity.id !== null && entity.id !== undefined,
      );
      promise = entitiesCommand.delete(agents);
    }

    try {
      await promise;
      void refetch();
    } catch (error) {
      showError(error as Error);
    }
  }, [
    selectionType,
    selectedEntities,
    allEntities,
    // @ts-expect-error
    gmp.agents,
    refetch,
    showError,
  ]);

  const handleFilterChanged = useCallback(
    (newFilter?: Filter) => {
      changeFilter(newFilter);
    },
    [changeFilter],
  );

  const handleFilterReset = useCallback(() => {
    resetFilter();
  }, [resetFilter]);

  const handleFilterRemoved = useCallback(() => {
    removeFilter();
  }, [removeFilter]);

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

  /* Todo this should not be necessary as tanstackquery should auto invalidated and refetch */
  /*   const handleRefetch = useCallback(async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refetching agents:', error);
    }
  }, [refetch]); */

  const openConfirmDeleteDialog = useCallback((agent: Agent) => {
    setDeleteAgent(agent);
    setConfirmDeleteDialogVisible(true);
  }, []);

  const closeConfirmDeleteDialog = useCallback(() => {
    setConfirmDeleteDialogVisible(false);
    setDeleteAgent(undefined);
    setIsDeleting(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteAgent?.id || !deleteFuncRef.current) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteFuncRef.current(deleteAgent);
      closeConfirmDeleteDialog();
    } catch (error) {
      showError(error as Error);
      setIsDeleting(false);
    }
  }, [deleteAgent, showError, closeConfirmDeleteDialog]);

  const isLoading = isFilterLoading || isDataLoading;
  return (
    <AgentComponent
      onCreateError={showError}
      //    onCreated={handleRefetch}
      onDeleteError={showError}
      //    onDeleted={handleRefetch}
      onSaveError={showError}
      //    onSaved={handleRefetch}
    >
      {({create, clone, delete: deleteFunc, edit, authorize}) => {
        deleteFuncRef.current = deleteFunc;

        return (
          <>
            <PageTitle title={_('Agents')} />
            <EntitiesPage
              createFilterType="agent"
              dashboard={() => <AgentsDashboard filter={filter} />}
              dashboardControls={() => (
                <DashboardControls dashboardId={AGENTS_DASHBOARD_ID} />
              )}
              entities={allEntities}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={AgentsFilterDialog}
              filtersFilter={AGENTS_FILTER_FILTER}
              isLoading={isLoading}
              sectionIcon={<HatAndGlassesIcon size="large" />}
              table={
                <AgentsTable
                  entities={allEntities}
                  entitiesCounts={entitiesCounts}
                  filter={filter}
                  // @ts-expect-error
                  selectionType={selectionType}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onAgentAuthorizeClick={authorize}
                  onAgentCloneClick={clone}
                  onAgentDeleteClick={openConfirmDeleteDialog}
                  onAgentEditClick={edit}
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
              }
              title={_('Agents')}
              toolBarIcons={
                <AgentListPageToolBarIcons onAgentCreateClick={create} />
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
            {confirmDeleteDialogVisible && deleteAgent && (
              <ConfirmationDialog
                content={_(
                  'Are you certain you want to permanently remove the agent "{{name}}"?\nThis operation is irreversible.\nAfter removal, reinstalling the agent will be necessary.',
                  {name: deleteAgent.name || 'Unknown Agent'},
                )}
                loading={isDeleting}
                rightButtonAction={DELETE_ACTION}
                rightButtonTitle={_('Delete')}
                title={_('Confirm Deletion')}
                onClose={closeConfirmDeleteDialog}
                onResumeClick={handleConfirmDelete}
              />
            )}
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
    </AgentComponent>
  );
};

export default AgentListPage;
