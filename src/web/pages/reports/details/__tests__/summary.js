/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import Capabilities from 'gmp/capabilities/capabilities';

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';
import {getMockDeltaReport} from 'web/pages/reports/__mocks__/mockdeltareport';

import Summary from '../summary';

setLocale('en');

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const caps = new Capabilities(['everything']);

describe('Report Summary tests', () => {
  test('should render Report Summary', () => {
    const {report} = getMockReport();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {element, queryAllByTestId} = render(
      <Summary
        filter={filter}
        report={report}
        reportId={report.id}
        isUpdating={false}
      />,
    );

    const tableData = element.querySelectorAll('td');
    const links = element.querySelectorAll('a');
    const progressbar = queryAllByTestId('progressbar-box');

    expect(tableData[0]).toHaveTextContent('Task Name');
    expect(links[0]).toHaveAttribute('href', '/task/314');
    expect(tableData[1]).toHaveTextContent('foo');

    expect(tableData[2]).toHaveTextContent('Comment');
    expect(tableData[3]).toHaveTextContent('bar');

    expect(tableData[4]).toHaveTextContent('Scan Time');
    expect(tableData[5]).toHaveTextContent(
      'Mon, Jun 3, 2019 1:00 PM CEST - Mon, Jun 3, 2019 1:31 PM CEST',
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

  test('should render Delta Report Summary', () => {
    const {report} = getMockDeltaReport();

    const {render, store} = rendererWith({
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {element, queryAllByTestId} = render(
      <Summary filter={filter} report={report} reportId={report.id} />,
    );

    const tableData = element.querySelectorAll('td');
    const links = element.querySelectorAll('a');
    const progressbar = queryAllByTestId('progressbar-box');

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
      'Mon, Jun 3, 2019 1:00 PM CEST - Mon, Jun 3, 2019 1:31 PM CEST',
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
      'Mon, May 20, 2019 2:00 PM CEST - Mon, May 20, 2019 2:30 PM CEST',
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
