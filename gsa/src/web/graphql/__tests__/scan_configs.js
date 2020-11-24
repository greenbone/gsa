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
/* eslint-disable react/prop-types */
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';
import {useLazyGetScanConfigs} from '../scan_configs';
import {createGetScanConfigsQueryMock} from '../__mocks__/scan_configs';

const GetLazyScanConfigsComponent = () => {
  const [
    getScanConfigs,
    {counts, loading, scanConfigs},
  ] = useLazyGetScanConfigs();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getScanConfigs()} />
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
      {isDefined(scanConfigs) ? (
        scanConfigs.map(scanConfig => {
          return (
            <div key={scanConfig.id} data-testid="scanConfig">
              {scanConfig.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-scanConfigs" />
      )}
    </div>
  );
};

describe('useLazyGetScanConfigs tests', () => {
  test('should query scanConfigs after user interaction', async () => {
    const [mock, resultFunc] = createGetScanConfigsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyScanConfigsComponent />);

    let scanConfigElements = screen.queryAllByTestId('scanConfig');
    expect(scanConfigElements).toHaveLength(0);

    expect(screen.queryByTestId('no-scanConfigs')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scanConfigElements = screen.getAllByTestId('scanConfig');
    expect(scanConfigElements).toHaveLength(1);

    expect(scanConfigElements[0]).toHaveTextContent('314');

    expect(screen.queryByTestId('no-scanConfigs')).not.toBeInTheDocument();

    await wait();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});
