/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {useLazyGetScanners} from '../scanners';
import {createGetScannersQueryMock} from '../__mocks__/scanners';

const GetLazyScannersComponent = () => {
  const [getScanners, {counts, loading, scanners}] = useLazyGetScanners();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getScanners()} />
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
      {isDefined(scanners) ? (
        scanners.map(scanner => {
          return (
            <div key={scanner.id} data-testid="scanner">
              {scanner.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-scanner" />
      )}
    </div>
  );
};

describe('useLazyGetScanner tests', () => {
  test('should query scanners after user interaction', async () => {
    const [mock, resultFunc] = createGetScannersQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyScannersComponent />);

    let scannerElements = screen.queryAllByTestId('scanner');
    expect(scannerElements).toHaveLength(0);

    let noScanners = screen.queryByTestId('no-scanner');
    expect(noScanners).toBeInTheDocument();
    const noCounts = screen.queryByTestId('no-counts');
    expect(noCounts).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scannerElements = screen.getAllByTestId('scanner');
    expect(scannerElements).toHaveLength(2);

    expect(scannerElements[0]).toHaveTextContent('scanner 1');
    expect(scannerElements[1]).toHaveTextContent('scanner 2');

    noScanners = screen.queryByTestId('no-scanner');
    expect(noScanners).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
