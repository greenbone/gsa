/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Dashboard from 'web/components/dashboard/dashboard';

import {
  TicketsCreatedDisplay,
  TicketsCreatedTableDisplay,
} from './createddisplay';
import {TicketsStatusDisplay, TicketsStatusTableDisplay} from './statusdisplay';
import {
  TicketsAssignedUsersDisplay,
  TicketsAssignedUsersTableDisplay,
} from './usersassigneddisplay';

export const TICKETS_DASHBOARD_ID = '70b0626f-a835-478e-8194-e09f97887a15';

export const TICKETS_DISPLAYS = [
  TicketsAssignedUsersDisplay.displayId,
  TicketsCreatedDisplay.displayId,
  TicketsStatusDisplay.displayId,
  TicketsAssignedUsersTableDisplay.displayId,
  TicketsCreatedTableDisplay.displayId,
  TicketsStatusTableDisplay.displayId,
];

const TicketsDashboard = props => (
  <Dashboard
    {...props}
    defaultDisplays={[
      [
        TicketsStatusDisplay.displayId,
        TicketsAssignedUsersDisplay.displayId,
        TicketsCreatedDisplay.displayId,
      ],
    ]}
    id={TICKETS_DASHBOARD_ID}
    permittedDisplays={TICKETS_DISPLAYS}
  />
);

export default TicketsDashboard;
