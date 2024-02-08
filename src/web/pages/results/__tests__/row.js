/* Copyright (C) 2019-2023 Greenbone AG
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
import {rendererWith} from 'web/utils/testing';
import Row from '../row';
import Result from 'gmp/models/result';

describe('Delta reports V2 with changed severity, qod and hostname', () => {
  const {render} = rendererWith();

  test('should render Delta Difference icon', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      delta: {
        result: {
          _id: '102',
          name: 'Result 2',
          host: {__text: '123.456.78.910', hostname: 'bar'},
          port: '80/tcp',
          severity: 2.6,
          qod: {value: 70},
        },
      },
    });

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} />
        </tbody>
      </table>,
    );
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toEqual(3);
    expect(icons[0]).toHaveAttribute('title', 'Severity is changed from 2.6.');
    expect(icons[1]).toHaveAttribute('title', 'QoD is changed from 70.');
    expect(icons[2]).toHaveAttribute('title', 'Hostname is changed from bar.');
  });
});

describe('Delta reports V2 with same severity, qod and hostname', () => {
  const {render} = rendererWith();

  test('should not render Delta Difference icon', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      delta: {
        result: {
          _id: '102',
          name: 'Result 2',
          host: {__text: '123.456.78.910', hostname: 'foo'},
          port: '80/tcp',
          severity: 10.0,
          qod: {value: 80},
        },
      },
    });

    const {queryAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} />
        </tbody>
      </table>,
    );
    const icons = queryAllByTestId('svg-icon');

    expect(icons.length).toBe(0);
  });
});

describe('Audit reports with compliance', () => {
  const {render} = rendererWith();

  test('should render Audit report with compliance yes', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'yes',
    });

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} audit={true} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');

    expect(bars[0]).toHaveAttribute('title', 'Yes');
    expect(bars[0]).toHaveTextContent('Yes');
  });

  test('should render Audit report with compliance no', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'no',
    });

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} audit={true} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'No');
    expect(bars[0]).toHaveTextContent('No');
  });

  test('should render Audit report with compliance incomplete', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'incomplete',
    });

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} audit={true} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Incomplete');
    expect(bars[0]).toHaveTextContent('Incomplete');
  });

  test('should render Audit report with compliance undefined', () => {
    const entity = Result.fromElement({
      _id: '101',
      name: 'Result 1',
      host: {__text: '123.456.78.910', hostname: 'foo'},
      port: '80/tcp',
      severity: 10.0,
      qod: {value: 80},
      notes: [],
      overrides: [],
      tickets: [],
      compliance: 'undefined',
    });

    const {getAllByTestId} = render(
      <table>
        <tbody>
          <Row entity={entity} audit={true} />
        </tbody>
      </table>,
    );
    const bars = getAllByTestId('progressbar-box');
    expect(bars[0]).toHaveAttribute('title', 'Undefined');
    expect(bars[0]).toHaveTextContent('Undefined');
  });
});
