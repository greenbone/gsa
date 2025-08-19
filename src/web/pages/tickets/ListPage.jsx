/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';
import DashboardControls from 'web/components/dashboard/Controls';
import {TicketIcon} from 'web/components/icon';
import ManualIcon from 'web/components/icon/ManualIcon';
import PageTitle from 'web/components/layout/PageTitle';
import EntitiesPage from 'web/entities/EntitiesPage';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';
import useTranslation from 'web/hooks/useTranslation';
import TicketsDashboard, {
  TICKETS_DASHBOARD_ID,
} from 'web/pages/tickets/dashboard';
import Table from 'web/pages/tickets/Table';
import TicketComponent from 'web/pages/tickets/TicketComponent';
import TicketFilterDialog from 'web/pages/tickets/TicketFilterDialog';
import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tickets';
import PropTypes from 'web/utils/PropTypes';
const ToolBarIcons = () => {
  const [_] = useTranslation();

  return (
    <ManualIcon
      anchor="managing-tickets"
      page="reports"
      title={_('Help: Remediation Tickets')}
    />
  );
};

const Page = ({
  filter,
  onFilterChanged,

  onChanged,
  onDownloaded,
  onError,
  ...props
}) => {
  const [_] = useTranslation();

  return (
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
              />
            )}
            dashboardControls={() => (
              <DashboardControls dashboardId={TICKETS_DASHBOARD_ID} />
            )}
            filter={filter}
            filterEditDialog={TicketFilterDialog}
            filtersFilter={TICKETS_FILTER_FILTER}
            sectionIcon={<TicketIcon size="large" />}
            table={Table}
            title={_('Tickets')}
            toolBarIcons={ToolBarIcons}
            onChanged={onChanged}
            onError={onError}
            onFilterChanged={onFilterChanged}
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
};

Page.propTypes = {
  filter: PropTypes.model,
  onChanged: PropTypes.func.isRequired,
  onDownloaded: PropTypes.func.isRequired,
  onError: PropTypes.func.isRequired,
  onFilterChanged: PropTypes.func.isRequired,
};

export default withEntitiesContainer('ticket', {
  entitiesSelector,
  loadEntities,
})(Page);
