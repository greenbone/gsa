/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Result from 'gmp/models/result';

import {rendererWith} from 'web/utils/testing';

import Row from '../row';

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
