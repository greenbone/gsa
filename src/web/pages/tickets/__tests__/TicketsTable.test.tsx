/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Ticket from 'gmp/models/ticket';
import {createSession} from 'gmp/testing';
import TicketsTable from 'web/pages/tickets/TicketsTable';

const ticket = Ticket.fromElement({
  _id: 'tk1',
  name: 'Test Vulnerability',
  status: 'open',
  severity: 8.5,
  host: '192.168.1.100',
  solution_type: 'VendorFix',
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  task: {_id: 't1', name: 'Test Task'},
  report: {_id: 'r1', timestamp: '2024-01-15T10:00:00Z'},
  result: {_id: 'res1'},
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 10,
});

const filter = QueryFilter.fromString('rows=10 first=1');

const gmp = {
  settings: {severityRating: 'CVSSv3'},
  session: createSession({username: 'admin'}),
};

describe('TicketsTable', () => {
  test('should render table with actions column by default', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(
      <TicketsTable
        entities={[ticket]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const table = screen.getByRole('table');
    within(table).getByRole('columnheader', {name: 'Actions'});
  });

  test('should render empty state without entities', () => {
    const {render} = rendererWith({gmp, capabilities: true, router: true});
    render(
      <TicketsTable entities={[]} entitiesCounts={counts} filter={filter} />,
    );

    screen.getByText('No tickets available');
  });
});
