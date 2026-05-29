/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockDeltaReport} from 'web/pages/reports/__fixtures__/MockDeltaReport';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import Summary from 'web/pages/reports/details/Summary';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const createGmp = () => ({
  session: createSession({timezone: 'CET', token: 'test-token'}),
  settings: {
    reloadInterval: 5000,
    reloadIntervalActive: 2000,
    reloadIntervalInactive: 10000,
  },
  reporthosts: {
    get: () =>
      Promise.resolve({
        data: [{ip: '123.456.78.910'}, {ip: '109.876.54.321'}],
        meta: {
          filter: filter,
          counts: new CollectionCounts({
            all: 2,
            filtered: 2,
            first: 1,
            rows: 2,
            length: 2,
          }),
        },
      }),
  },
});

describe('Report Summary tests', () => {
  test('should render Report Summary', async () => {
    const {report} = getMockReport();

    const {render} = rendererWith({
      gmp: createGmp(),
      capabilities: true,
      router: true,
    });

    const {element} = render(
      <Summary
        filter={filter}
        isUpdating={false}
        report={report}
        reportId={report.id as string}
      />,
    );

    expect(await screen.findByText('Hosts scanned')).toBeInTheDocument();

    const tableData = element.querySelectorAll('td');
    const links = element.querySelectorAll('a');
    const progressbar = screen.queryAllByTestId('progressbar-box');

    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[0]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Scan Time');
    expect(tableData[5]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );

    expect(tableData[6]).toHaveTextContent('Scan Duration');
    expect(tableData[7]).toHaveTextContent('0:31 h');

    expect(tableData[8]).toHaveTextContent('Scan Status');
    expect(progressbar[0]).toHaveTextContent('Done');

    expect(tableData[10]).toHaveTextContent('Hosts scanned');
    expect(tableData[11]).toHaveTextContent('2');

    expect(tableData[12]).toHaveTextContent('Filter');
    expect(tableData[13]).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
    );

    expect(tableData[14]).toHaveTextContent('Timezone');
    expect(tableData[15]).toHaveTextContent('UTC (UTC)');
  });

  test('should render Delta Report Summary', async () => {
    const {report} = getMockDeltaReport();

    const {render} = rendererWith({
      capabilities: true,
      router: true,
      gmp: createGmp(),
    });

    const {element} = render(
      <Summary
        filter={filter}
        report={report}
        reportId={report.id as string}
      />,
    );

    // Wait for async hosts data to load
    await waitFor(() => {
      expect(screen.getByText('Hosts scanned')).toBeInTheDocument();
    });

    const tableData = element.querySelectorAll('td');
    const links = element.querySelectorAll('a');
    const progressbar = screen.queryAllByTestId('progressbar-box');

    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[0]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Report 1');
    expect(links[1]).toHaveAttribute('href', '/report/1234');
    expect(tableData[5]).toHaveTextContent('1234');

    expect(tableData[6]).toHaveTextContent('Scan Time Report 1');
    expect(tableData[7]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM Central European Summer Time - Mon, Jun 3, 2019 1:31 PM Central European Summer Time',
    );

    expect(tableData[8]).toHaveTextContent('Scan Duration Report 1');
    expect(tableData[9]).toHaveTextContent('0:31 h');

    expect(tableData[10]).toHaveTextContent('Scan Status Report 1');
    expect(progressbar[0]).toHaveTextContent('Done');

    expect(tableData[12]).toHaveTextContent('Report 2');
    expect(links[2]).toHaveAttribute('href', '/report/5678');
    expect(tableData[13]).toHaveTextContent('5678');

    expect(tableData[14]).toHaveTextContent('Scan Time Report 2');
    expect(tableData[15]).toHaveTextContent(
      'Mon, May 20, 2019 2:00 PM Central European Summer Time - Mon, May 20, 2019 2:30 PM Central European Summer Time',
    );

    expect(tableData[16]).toHaveTextContent('Scan Duration Report 2');
    expect(tableData[17]).toHaveTextContent('0:30 h');

    expect(tableData[18]).toHaveTextContent('Scan Status Report 2');
    expect(progressbar[1]).toHaveTextContent('Done');

    expect(tableData[20]).toHaveTextContent('Hosts scanned');
    expect(tableData[21]).toHaveTextContent('2');

    expect(tableData[22]).toHaveTextContent('Filter');
    expect(tableData[23]).toHaveTextContent(
      'apply_overrides=0 levels=hml min_qod=70',
    );

    expect(tableData[24]).toHaveTextContent('Timezone');
    expect(tableData[25]).toHaveTextContent('UTC (UTC)');
  });

  // TODO: should render report error
});
