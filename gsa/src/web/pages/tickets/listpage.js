/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import _ from 'gmp/locale';

import {TICKETS_FILTER_FILTER} from 'gmp/models/filter';

import TicketIcon from 'web/components/icon/ticketicon';

import DashboardControls from 'web/components/dashboard/controls';

import {createFilterDialog} from 'web/components/powerfilter/dialog';

import EntitiesPage from 'web/entities/page';
import withEntitiesContainer from 'web/entities/withEntitiesContainer';

import {
  loadEntities,
  selector as entitiesSelector,
} from 'web/store/entities/tickets';

import PropTypes from 'web/utils/proptypes';

import TicketComponent from './component';
import TicketsDashboard, {TICKETS_DASHBOARD_ID} from './dashboard';
import Table, {FIELDS} from './table';

const FilterDialog = createFilterDialog({
  sortFields: FIELDS,
});

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
        filterEditDialog={FilterDialog}
        filtersFilter={TICKETS_FILTER_FILTER}
        sectionIcon={<TicketIcon size="large" />}
        table={Table}
        title={_('Tickets')}
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
