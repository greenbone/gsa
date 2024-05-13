/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';
import {getMockAuditReport} from 'web/pages/reports/__mocks__/mockauditreport';

import HostsTab from '../hoststab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

const gmp = {
  settings: {},
};

describe('Report Hosts Tab tests', () => {
  test('should render Report Hosts Tab', () => {
    const {hosts} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <HostsTab
        counts={hosts.counts}
        filter={filter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');
    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('IP Address');
    expect(header[1]).toHaveTextContent('Hostname');
    expect(header[2]).toHaveTextContent('OS');
    expect(header[3]).toHaveTextContent('Ports');
    expect(header[4]).toHaveTextContent('Apps');
    expect(header[5]).toHaveTextContent('Distance');
    expect(header[6]).toHaveTextContent('Auth');
    expect(header[7]).toHaveTextContent('Start');
    expect(header[8]).toHaveTextContent('End');
    expect(header[9]).toHaveTextContent('High');
    expect(header[10]).toHaveTextContent('Medium');
    expect(header[11]).toHaveTextContent('Low');
    expect(header[12]).toHaveTextContent('Log');
    expect(header[13]).toHaveTextContent('False Positive');
    expect(header[14]).toHaveTextContent('Total');
    expect(header[15]).toHaveTextContent('Severity');

    // Row 1
    expect(links[15]).toHaveAttribute('href', '/host/123');
    expect(links[15]).toHaveTextContent('123.456.78.910');
    expect(rows[1]).toHaveTextContent('foo.bar');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[1]).toHaveTextContent('1032'); // 10 Ports, 3 Apps, 2 Distance
    expect(rows[1]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');
    expect(rows[1]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[1]).toHaveTextContent('143050150'); // 14 High, 30 Medium, 5 Low, 0 Log, 1 False Positive, 50 Total
    expect(bars[0]).toHaveAttribute('title', 'High');
    expect(bars[0]).toHaveTextContent('10.0 (High)');

    // Row 2
    expect(links[16]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    ); // filter by name because host has no asset id
    expect(links[16]).toHaveTextContent('109.876.54.321');
    expect(rows[2]).toHaveTextContent('lorem.ipsum');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[2]).toHaveTextContent('1521'); // 15 Ports, 2 Apps, 1 Distance
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:31 PM CEST');
    expect(rows[2]).toHaveTextContent('53005040'); // 5 High, 30 Medium, 0 Low, 5 Log, 0 False Positive, 40 Total
    expect(bars[1]).toHaveAttribute('title', 'Medium');
    expect(bars[1]).toHaveTextContent('5.0 (Medium)');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});

const auditfilter = Filter.fromString(
  'apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant',
);

describe('Audit Report Hosts Tab tests', () => {
  test('should render Audit Report Hosts Tab', () => {
    const {hosts} = getMockAuditReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement, getAllByTestId} = render(
      <HostsTab
        audit={true}
        counts={hosts.counts}
        filter={auditfilter}
        hosts={hosts.entities}
        isUpdating={false}
        sortField={'compliant'}
        sortReverse={false}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('hosts', sortField)}
      />,
    );

    const images = baseElement.querySelectorAll('img');
    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');

    const bars = getAllByTestId('progressbar-box');

    // Headings
    expect(header[0]).toHaveTextContent('IP Address');
    expect(header[1]).toHaveTextContent('Hostname');
    expect(header[2]).toHaveTextContent('OS');
    expect(header[3]).toHaveTextContent('Ports');
    expect(header[4]).toHaveTextContent('Apps');
    expect(header[5]).toHaveTextContent('Distance');
    expect(header[6]).toHaveTextContent('Auth');
    expect(header[7]).toHaveTextContent('Start');
    expect(header[8]).toHaveTextContent('End');
    expect(header[9]).toHaveTextContent('Yes');
    expect(header[10]).toHaveTextContent('No');
    expect(header[11]).toHaveTextContent('Incomplete');
    expect(header[12]).toHaveTextContent('Total');
    expect(header[13]).toHaveTextContent('Compliant');

    // Row 1
    expect(links[13]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    ); // filter by name because host has no asset id
    expect(links[13]).toHaveTextContent('109.876.54.321');
    expect(rows[1]).toHaveTextContent('lorem.ipsum');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[1]).toHaveTextContent('1521'); // 15 Ports, 2 Apps, 1 Distance
    expect(rows[1]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[1]).toHaveTextContent('Mon, Jun 3, 2019 1:31 PM CEST');
    expect(rows[1]).toHaveTextContent('170540'); // 17 Yes, 0 No, 5 Incomplete, 40 Total
    expect(bars[0]).toHaveAttribute('title', 'Incomplete');
    expect(bars[0]).toHaveTextContent('Incomplete');

    // Row 2
    expect(links[14]).toHaveAttribute('href', '/host/123');
    expect(links[14]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('foo.bar');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[2]).toHaveTextContent('1032'); // 10 Ports, 3 Apps, 2 Distance
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[2]).toHaveTextContent('7301450'); // 7 Yes, 30 No, 14 Incomplete, 50 Total
    expect(bars[1]).toHaveAttribute('title', 'No');
    expect(bars[1]).toHaveTextContent('No');

    // Row 3
    expect(links[15]).toHaveAttribute('href', '/host/123');
    expect(links[15]).toHaveTextContent('123.456.78.810');
    expect(rows[3]).toHaveTextContent('foo.bar');
    expect(images[0]).toHaveAttribute('src', '/img/os_unknown.svg');
    expect(rows[3]).toHaveTextContent('1032'); // 10 Ports, 3 Apps, 2 Distance
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:00 PM CEST');
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:15 PM CEST');
    expect(rows[3]).toHaveTextContent('200020'); // 20 Yes, 0 No, 0 Incomplete, 20 Total
    expect(bars[2]).toHaveAttribute('title', 'Yes');
    expect(bars[2]).toHaveTextContent('Yes');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hmlg rows=3 min_qod=70 first=1 sort=compliant)',
    );
  });
});
