/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import {createSession} from 'gmp/testing';
import WebApplicationScanningResultsTable from 'web/pages/reports/details/result/WebApplicationScanningResultsTable';

const filter = Filter.fromString('first=1 rows=10');

const createGmp = () => ({
  settings: {
    enableEPSS: false,
  },
  session: createSession(),
});

const createMockResult = (overrides = {}) =>
  Result.fromElement({
    _id: '101',
    name: 'Test Web Result',
    severity: 7.5,
    qod: {value: 80},
    host: {
      asset: {
        _asset_id: 'host-1',
      },
      hostname: 'https://example.com',
    },
    port: '443',
    creation_time: '2025-01-15T10:00:00Z',
    nvt: {
      _oid: '1.3.6.1.4.1.25623.1.0.99999',
      type: 'nvt',
      name: 'Test Web Result',
      solution: {
        _type: 'VendorFix',
      },
    },
    ...overrides,
  });

describe('WebApplicationScanningResultsTable', () => {
  test('should render expected columns', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});

    render(
      <WebApplicationScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(columnHeaders.some(th => /NVT/i.exec(th.textContent))).toBe(true);
    expect(
      screen.getByRole('button', {name: /Solution Type/i}),
    ).toBeInTheDocument();
    expect(columnHeaders.some(th => /Severity/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /QoD/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /URL/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Port/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Created/i.exec(th.textContent))).toBe(
      true,
    );
  });

  test('should render host URL when host id is present', () => {
    const entities = [createMockResult()];
    const counts = new CollectionCounts({
      filtered: 1,
      all: 1,
      first: 1,
      rows: 10,
    });
    const {render} = rendererWith({gmp: createGmp(), capabilities: true});

    render(
      <WebApplicationScanningResultsTable
        entities={entities}
        entitiesCounts={counts}
        filter={filter}
        sortBy="severity"
        sortDir="desc"
      />,
    );

    expect(screen.getByText('https://example.com')).toBeInTheDocument();
  });
});
