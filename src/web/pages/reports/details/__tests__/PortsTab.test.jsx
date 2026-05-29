/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import ReportPort from 'gmp/models/report/port';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import PortsTab from 'web/pages/reports/details/port/PortsTab';

const reportFilter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const port1 = ReportPort.fromElement({
  host: '1.1.1.1',
  __text: '123/tcp',
  severity: 10.0,
  threat: 'High',
});
port1.addHost({ip: '1.1.1.1'});

const port2 = ReportPort.fromElement({
  host: '2.2.2.2',
  __text: '456/tcp',
  severity: 5.0,
  threat: 'Medium',
});
port2.addHost({ip: '2.2.2.2'});

const ports = [port1, port2];

const portsData = {
  entities: ports,
  entitiesCounts: new CollectionCounts({
    first: 1,
    all: 2,
    filtered: 2,
    length: 2,
    rows: 10,
  }),
};

describe('Report Ports Tab tests', () => {
  test('should render Report Ports Tab', async () => {
    const {render} = rendererWith({
      gmp: {
        settings: {
          severityRating: SEVERITY_RATING_CVSS_3,
        },
        session: createSession({token: 'test-token', username: 'admin'}),
      },
      router: true,
    });

    const {baseElement} = render(
      <PortsTab
        portsData={portsData}
        reportFilter={reportFilter}
        reportId="1234"
      />,
    );

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = screen.getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('Port');
    expect(header[1]).toHaveTextContent('Hosts');
    expect(header[2]).toHaveTextContent('Severity');

    // Row 1 (sorted by severity ascending: 5.0 before 10.0 due to sort-reverse=severity)
    expect(rows[1]).toHaveTextContent('456/tcp1'); // Port 456/tcp, Hosts 1
    expect(bars[0]).toHaveAttribute('title', 'Medium');
    expect(bars[0]).toHaveTextContent('5.0 (Medium)');

    // Row 2
    expect(rows[2]).toHaveTextContent('123/tcp1'); // Port 123/tcp, Hosts 1
    expect(bars[1]).toHaveAttribute('title', 'Critical');
    expect(bars[1]).toHaveTextContent('10.0 (Critical)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
