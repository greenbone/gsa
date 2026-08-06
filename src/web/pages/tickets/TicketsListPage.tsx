/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useCallback} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import type CollectionCounts from 'gmp/collection/collection-counts';
import type Rejection from 'gmp/http/rejection';
import {
  type FilterType,
  RESET_FILTER,
  TICKETS_FILTER_FILTER,
} from 'gmp/models/filter';
import type Ticket from 'gmp/models/ticket';
import DashboardControlsContainer from 'web/components/dashboard/DashboardControlsContainer';
import Download from 'web/components/form/Download';
import useDownload from 'web/components/form/useDownload';
import {TicketIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import DialogNotification from 'web/components/notification/DialogNotification';
import useDialogNotification from 'web/components/notification/useDialogNotification';
import SubscriptionProvider from 'web/components/provider/SubscriptionProvider';
import EntitiesPage from 'web/entities/EntitiesPage';
import {useGetTickets} from 'web/hooks/use-query/tickets';
import useFilterSortBy from 'web/hooks/useFilterSortBy';
import useGmp from 'web/hooks/useGmp';
import usePageFilter from 'web/hooks/usePageFilter';
import usePagination from 'web/hooks/usePagination';
import useSelection from 'web/hooks/useSelection';
import useTranslation from 'web/hooks/useTranslation';
import TicketsDashboard, {
  TICKETS_DASHBOARD_ID,
} from 'web/pages/tickets/dashboard';
import TicketComponent from 'web/pages/tickets/TicketComponent';
import TicketFilterDialog from 'web/pages/tickets/TicketFilterDialog';
import TicketsTable from 'web/pages/tickets/TicketsTable';
import SelectionType from 'web/utils/selection-type';

interface ToolBarIconsProps {
  onTicketCreateClick?: () => void | Promise<void>;
}

interface TicketsDashboardProps {
  filter?: FilterType;
  onFilterChanged: (filter: FilterType) => void;
}

const ToolBarIcons = ({onTicketCreateClick}: ToolBarIconsProps) => {
  const [_] = useTranslation();

  return (
    <ManualIcon
      anchor="managing-tickets"
      page="reports"
      title={_('Help: Remediation Tickets')}
    />
  );
};

const TicketsDashboardSection = ({
  filter,
  onFilterChanged,
}: TicketsDashboardProps) => (
  <SubscriptionProvider>
    {() => (
      <TicketsDashboard filter={filter} onFilterChanged={onFilterChanged} />
    )}
  </SubscriptionProvider>
);

const TicketsDashboardControls = () => (
  <DashboardControlsContainer dashboardId={TICKETS_DASHBOARD_ID} />
);

const TicketsListPage = () => {
  const [_] = useTranslation();
  const queryClient = useQueryClient();
  const {dialogState, closeDialog, showError} = useDialogNotification();
  const [downloadRef, handleDownload] = useDownload();
  const {title: dialogTitle, message: dialogMessage} = dialogState;

  const [filter, , {changeFilter, removeFilter, resetFilter}] = usePageFilter(
    'ticket',
    'ticket',
    {
      fallbackFilter: RESET_FILTER,
    },
  );

  const {
    data,
    isLoading: isLoadingEntities,
    isFetching: isUpdating,
  } = useGetTickets({filter});
  const entities = data?.entities;
  const entitiesCounts = data?.entitiesCounts;

  const [sortBy, sortDir, handleSortChange] = useFilterSortBy(
    filter,
    changeFilter,
  );

  const handleFilterChanged = (newFilter: FilterType) => {
    changeFilter(newFilter);
  };

  const [getFirst, getLast, getNext, getPrevious] = usePagination(
    filter,
    entitiesCounts ?? ({} as CollectionCounts),
    handleFilterChanged,
  );

  const onChanged = useCallback(() => {
    void queryClient.invalidateQueries({queryKey: ['get_tickets']});
  }, [queryClient]);

  const gmp = useGmp();
  const {
    selectionType,
    selected: selectedEntities = [],
    changeSelectionType,
    select,
    deselect,
  } = useSelection<Ticket>();

  const handleBulkDelete = useCallback(async () => {
    let promise;
    if (selectionType === SelectionType.SELECTION_USER) {
      promise = gmp.tickets.delete(selectedEntities);
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      promise = gmp.tickets.deleteByFilter(filter.all());
    } else {
      promise = gmp.tickets.deleteByFilter(filter);
    }

    try {
      await promise;
      onChanged();
    } catch (error) {
      showError(error as Error);
    }
  }, [
    filter,
    gmp.tickets,
    onChanged,
    selectedEntities,
    selectionType,
    showError,
  ]);

  const handleBulkDownload = useCallback(async () => {
    let promise;
    if (selectionType === SelectionType.SELECTION_USER) {
      promise = gmp.tickets.export(selectedEntities);
    } else if (selectionType === SelectionType.SELECTION_FILTER) {
      promise = gmp.tickets.exportByFilter(filter.all());
    } else {
      promise = gmp.tickets.exportByFilter(filter);
    }

    try {
      const response = await promise;
      handleDownload({filename: 'tickets.xml', data: response.data});
    } catch (error) {
      showError(error as Error);
    }
  }, [
    filter,
    gmp.tickets,
    handleDownload,
    selectedEntities,
    selectionType,
    showError,
  ]);

  const handleError = (error: Error | Rejection) => {
    showError(error);
  };

  return (
    <TicketComponent
      onCloneError={handleError}
      onCloned={onChanged}
      onCreated={onChanged}
      onDeleteError={handleError}
      onDeleted={onChanged}
      onDownloadError={handleError}
      onDownloaded={handleDownload}
      onSaved={onChanged}
    >
      {({clone, delete: deleteTicket, edit}) => (
        <>
          <DialogNotification
            message={dialogMessage}
            title={dialogTitle}
            onCloseClick={closeDialog}
          />
          <Download ref={downloadRef} />
          <PageTitle title={_('Tickets')} />
          <EntitiesPage<Ticket>
            createFilterType="ticket"
            dashboard={
              <TicketsDashboardSection
                filter={filter}
                onFilterChanged={handleFilterChanged}
              />
            }
            dashboardControls={<TicketsDashboardControls />}
            entities={entities}
            entitiesCounts={entitiesCounts}
            filter={filter}
            filterEditDialog={TicketFilterDialog as never}
            filtersFilter={TICKETS_FILTER_FILTER}
            isLoading={isLoadingEntities}
            sectionIcon={<TicketIcon size="large" />}
            table={
              <TicketsTable
                entities={entities}
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
                onTicketCloneClick={clone}
                onTicketDeleteClick={deleteTicket}
                onTicketEditClick={edit}
              />
            }
            title={_('Tickets')}
            toolBarIcons={<ToolBarIcons />}
            onError={handleError}
            onFilterChanged={handleFilterChanged}
            onFilterCreated={handleFilterChanged}
            onFilterRemoved={removeFilter}
            onFilterReset={resetFilter}
          />
        </>
      )}
    </TicketComponent>
  );
};

export default TicketsListPage;
