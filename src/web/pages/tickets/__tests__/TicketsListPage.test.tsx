/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import {Route, Routes} from 'react-router';
import {vi} from 'vitest';
import CollectionCounts from 'gmp/collection/collection-counts';
import QueryFilter from 'gmp/models/filter/query-filter';
import Ticket from 'gmp/models/ticket';
import {createSession} from 'gmp/testing';
import {currentSettingsDefaultResponse} from 'web/pages/__fixtures__/current-settings';
import TicketsListPage from 'web/pages/tickets/TicketsListPage';

vi.mock('web/pages/tickets/dashboard', () => ({
  default: () => null,
  TICKETS_DASHBOARD_ID: 'ticket-dashboard',
}));

const ticket = Ticket.fromElement({
  _id: 'tk1',
  name: 'Test Vulnerability',
  status: 'Open' as Ticket['status'],
  severity: 8.5,
  host: '192.168.1.100',
  solution_type: 'VendorFix',
  assigned_to: {user: {_id: 'u1', name: 'admin'}},
  open_time: '2024-01-10T08:00:00Z',
  creation_time: '2024-01-10T08:00:00Z',
  modification_time: '2024-01-15T10:00:00Z',
  owner: {name: 'admin'},
  permissions: {permission: [{name: 'everything'}]},
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

const createGmp = ({
  getTickets = testing.fn().mockResolvedValue({
    data: [ticket],
    meta: {
      filter: QueryFilter.fromString(),
      counts,
    },
  }),
  currentSettings = testing
    .fn()
    .mockResolvedValue(currentSettingsDefaultResponse),
} = {}) => ({
  ticket: {
    get: testing.fn().mockResolvedValue({data: ticket}),
    clone: testing.fn().mockResolvedValue({data: {id: 'cloned-id'}}),
    delete: testing.fn().mockResolvedValue(undefined),
    export: testing.fn().mockResolvedValue({data: 'some-data'}),
  },
  tickets: {
    get: getTickets,
    getAll: testing.fn().mockResolvedValue({
      data: [ticket],
      meta: {
        filter: QueryFilter.fromString(),
        counts,
      },
    }),
  },
  users: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  tags: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  settings: {
    manualUrl: 'test/',
    severityRating: 'CVSSv3',
  },
  dashboard: {
    getSetting: testing.fn().mockResolvedValue({data: {}}),
  },
  filters: {
    get: testing.fn().mockResolvedValue({
      data: [],
      meta: {
        filter: QueryFilter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  },
  session: createSession({token: 'test-token', timezone: 'CET'}),
  user: {
    currentSettings,
    getSetting: testing.fn().mockResolvedValue({data: {value: ''}}),
  },
});

describe('TicketsListPage tests', () => {
  test('should render without errors', () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: '/tickets',
    });

    const {container} = render(
      <Routes>
        <Route element={<TicketsListPage />} path="/tickets" />
      </Routes>,
    );

    expect(container).toBeInTheDocument();
  });

  test('should render with ticket data in table', async () => {
    const gmp = createGmp();
    const {render} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      route: '/tickets',
    });

    render(
      <Routes>
        <Route element={<TicketsListPage />} path="/tickets" />
      </Routes>,
    );

    const table = await screen.findByRole('table');
    expect(within(table).getByText('Test Vulnerability')).toBeInTheDocument();
    expect(within(table).getByText('192.168.1.100')).toBeInTheDocument();
  });
});
