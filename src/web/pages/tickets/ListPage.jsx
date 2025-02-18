/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import React from 'react';
import DashboardControls from 'web/components/dashboard/Controls';
import ManualIcon from 'web/components/icon/ManualIcon';
import TicketIcon from 'web/components/icon/TicketIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/Page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tickets';
import PropTypes from 'web/utils/PropTypes';

import TicketComponent from './Component';
import TicketsDashboard, {TICKETS_DASHBOARD_ID} from './dashboard';
import TicketsFilterDialogComponent from './FilterDialog';
import Table from './Table';

const ToolBarIcons = () => (
  <ManualIcon
    anchor="managing-tickets"
    page="reports"
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
    onCloneError={onError}
    onCloned={onChanged}
    onCloseError={onError}
    onClosed={onChanged}
    onCreated={onChanged}
    onDeleteError={onError}
    onDeleted={onChanged}
    onDownloadError={onError}
    onDownloaded={onDownloaded}
    onInteraction={onInteraction}
    onSaved={onChanged}
    onSolveError={onError}
    onSolved={onChanged}
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
