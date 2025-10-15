/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import type CollectionCounts from 'gmp/collection/CollectionCounts';
import type Agent from 'gmp/models/agent';
import {type default as Filter, AGENTS_FILTER_FILTER} from 'gmp/models/filter';
import {isDefined} from 'gmp/utils/identity';
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
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import {
  useBulkAuthorizeAgents,
  useBulkDeleteAgents,
  useBulkRevokeAgents,
  useGetAgents,
} from 'web/hooks/useQuery/agents';
import useSelection from 'web/hooks/useSelection';
import useTranslation from 'web/hooks/useTranslation';
import AgentComponent from 'web/pages/agents/AgentComponent';
import AgentsFilterDialog from 'web/pages/agents/AgentFilterDialog';
import AgentListPageToolBarIcons from 'web/pages/agents/AgentListPageToolBarIcons';
import AgentTable from 'web/pages/agents/AgentTable';
import AgentsDashboard, {AGENTS_DASHBOARD_ID} from 'web/pages/agents/dashboard';
import SelectionType from 'web/utils/SelectionType';

const AgentListPage = () => {
  const [_] = useTranslation();
  const [confirmDeleteDialogVisible, setConfirmDeleteDialogVisible] =
    useState(false);
  const [deleteAgent, setDeleteAgent] = useState<Agent | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTagsDialogVisible, setIsTagsDialogVisible] = useState(false);
  const [agents, setAgents] = useState<Agent[] | undefined>(undefined);
  const [entitiesCounts, setEntitiesCounts] = useState<
    CollectionCounts | undefined
  >(undefined);
  const deleteFuncRef = useRef<((agent: Agent) => Promise<void>) | undefined>(
    undefined,
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
    error,
    isError,
  } = useGetAgents({filter});

  useEffect(() => {
    setAgents(previousAgents => {
      return isDefined(agentsData?.entities)
        ? agentsData?.entities
        : previousAgents;
    });
    setEntitiesCounts(previousCounts => {
      return isDefined(agentsData?.entitiesCounts)
        ? agentsData?.entitiesCounts
        : previousCounts;
    });
  }, [agentsData, setAgents, setEntitiesCounts]);

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

  const bulkDelete = useBulkDeleteAgents({
    onError: showError,
  });
  const bulkAuthorize = useBulkAuthorizeAgents({
    onError: showError,
  });
  const bulkRevoke = useBulkRevokeAgents({
    onError: showError,
  });

  const handleBulkDelete = useCallback(async () => {
    let input: Agent[] | Filter;
    if (selectionType === SelectionType.SELECTION_USER) {
      input = selectedEntities;
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      input = filter.all();
    } else {
      input = agents ?? [];
    }

    try {
      await bulkDelete.mutateAsync(input);
    } catch (error) {
      showError(error as Error);
    }
  }, [selectionType, selectedEntities, filter, agents, bulkDelete, showError]);

  const handleBulkAuthorize = useCallback(async () => {
    const selectedAgents =
      selectionType === SelectionType.SELECTION_USER
        ? selectedEntities
        : (agents ?? []);
    try {
      await bulkAuthorize.mutateAsync(selectedAgents);
    } catch (error) {
      showError(error as Error);
    }
  }, [selectionType, selectedEntities, agents, showError, bulkAuthorize]);

  const handleBulkRevoke = useCallback(async () => {
    const selectedAgents =
      selectionType === SelectionType.SELECTION_USER
        ? selectedEntities
        : (agents ?? []);

    try {
      await bulkRevoke.mutateAsync(selectedAgents);
    } catch (error) {
      showError(error as Error);
    }
  }, [selectionType, selectedEntities, agents, showError, bulkRevoke]);

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

  const isUpdating = isFilterLoading || isDataLoading;
  return (
    <AgentComponent onDeleteError={showError} onSaveError={showError}>
      {({delete: deleteFunc, edit, authorize}) => {
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
              entities={agents}
              entitiesCounts={entitiesCounts}
              entitiesError={isError ? error : undefined}
              filter={filter}
              filterEditDialog={AgentsFilterDialog}
              filtersFilter={AGENTS_FILTER_FILTER}
              isLoading={isDataLoading}
              isLoadingFilters={isFilterLoading}
              sectionIcon={<HatAndGlassesIcon size="large" />}
              table={
                <AgentTable
                  entities={agents}
                  entitiesCounts={entitiesCounts}
                  filter={filter}
                  isUpdating={isUpdating}
                  selectionType={selectionType}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onAgentAuthorizeClick={authorize}
                  onAgentDeleteClick={openConfirmDeleteDialog}
                  onAgentEditClick={edit}
                  onAuthorizeBulk={handleBulkAuthorize}
                  onDeleteBulk={handleBulkDelete}
                  onEntityDeselected={deselect}
                  onEntitySelected={select}
                  onFirstClick={getFirst}
                  onLastClick={getLast}
                  onNextClick={getNext}
                  onPreviousClick={getPrevious}
                  onRevokeBulk={handleBulkRevoke}
                  onSelectionTypeChange={changeSelectionType}
                  onSortChange={handleSortChange}
                  onTagsBulk={openTagsDialog}
                />
              }
              title={_('Agents')}
              toolBarIcons={<AgentListPageToolBarIcons />}
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
                  {name: deleteAgent.name ?? 'Unknown Agent'},
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
                entities={agents as Agent[]}
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
