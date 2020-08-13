/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {useLazyGetAlerts} from '../alerts';
import {createGetAlertsQueryMock} from '../__mocks__/alerts';

const GetLazyAlertsComponent = () => {
  const [getAlerts, {counts, loading, alerts}] = useLazyGetAlerts();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getAlerts()} />
      {isDefined(counts) ? (
        <div data-testid="counts">
          <span data-testid="total">{counts.all}</span>
          <span data-testid="filtered">{counts.filtered}</span>
          <span data-testid="first">{counts.first}</span>
          <span data-testid="limit">{counts.rows}</span>
          <span data-testid="length">{counts.length}</span>
        </div>
      ) : (
        <div data-testid="no-counts" />
      )}
      {isDefined(alerts) ? (
        alerts.map(alert => {
          return (
            <div key={alert.id} data-testid="alert">
              {alert.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-alert" />
      )}
    </div>
  );
};

describe('useLazyGetAlert tests', () => {
  test('should query alerts after user interaction', async () => {
    const [mock, resultFunc] = createGetAlertsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyAlertsComponent />);

    let alertElements = screen.queryAllByTestId('alert');
    expect(alertElements).toHaveLength(0);

    let noAlerts = screen.queryByTestId('no-alert');
    expect(noAlerts).toBeInTheDocument();
    const noCounts = screen.queryByTestId('no-counts');
    expect(noCounts).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    alertElements = screen.getAllByTestId('alert');
    expect(alertElements).toHaveLength(2);

    expect(alertElements[0]).toHaveTextContent('alert 1');
    expect(alertElements[1]).toHaveTextContent('alert 2');

    noAlerts = screen.queryByTestId('no-alert');
    expect(noAlerts).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
