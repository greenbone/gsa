/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import _ from 'gmp/locale';

import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';

import ManualIcon from 'web/components/icon/manualicon';
import TicketIcon from 'web/components/icon/ticketicon';

import DashboardControls from 'web/components/dashboard/controls';

import PageTitle from 'web/components/layout/pagetitle';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tickets';

import PropTypes from 'web/utils/proptypes';

import TicketComponent from './component';
import TicketsDashboard, {TICKETS_DASHBOARD_ID} from './dashboard';
import Table from './table';
import TicketsFilterDialogComponent from './filterdialog';

const ToolBarIcons = () => (
  <ManualIcon
    page="reports"
    anchor="managing-tickets"
    title={_('Help: Remediation Tickets')}
  />
);

const Page = ({
  filter,
  onFilterChanged,
  onInteraction,
  onChanged,
  onDownloaded,
  onError,
  ...props
}) => (
  <TicketComponent
    onCreated={onChanged}
    onSaved={onChanged}
    onCloned={onChanged}
    onCloneError={onError}
    onClosed={onChanged}
    onCloseError={onError}
    onDeleted={onChanged}
    onDeleteError={onError}
    onDownloaded={onDownloaded}
    onDownloadError={onError}
    onInteraction={onInteraction}
    onSolved={onChanged}
    onSolveError={onError}
  >
    {({clone, close, delete: deleteTicket, edit, solve}) => (
      <React.Fragment>
        <PageTitle title={_('Tickets')} />
        <EntitiesPage
          {...props}
          dashboard={() => (
            <TicketsDashboard
              filter={filter}
              onFilterChanged={onFilterChanged}
              onInteraction={onInteraction}
            />
          )}
          dashboardControls={() => (
            <DashboardControls
              dashboardId={TICKETS_DASHBOARD_ID}
              onInteraction={onInteraction}
            />
          )}
          filter={filter}
          filterEditDialog={TicketsFilterDialogComponent}
          filtersFilter={TICKETS_FILTER_FILTER}
          sectionIcon={<TicketIcon size="large" />}
          table={Table}
          title={_('Tickets')}
          toolBarIcons={ToolBarIcons}
          onChanged={onChanged}
          onError={onError}
          onFilterChanged={onFilterChanged}
          onInteraction={onInteraction}
          onTicketClone={clone}
          onTicketClose={close}
          onTicketDelete={deleteTicket}
          onTicketEdit={edit}
          onTicketSolve={solve}
        />
      </React.Fragment>
    )}
  </TicketComponent>
);

Page.propTypes = {
  filter: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default withEntitiesContainer('ticket', {
  entitiesSelector,
  loadEntities,
})(Page);
