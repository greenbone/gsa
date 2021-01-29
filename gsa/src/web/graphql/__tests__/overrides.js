/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {useLazyGetOverrides} from '../overrides';

import {createGetOverridesQueryMock} from '../__mocks__/overrides';

const GetLazyOverridesComponent = () => {
  const [getOverrides, {counts, loading, overrides}] = useLazyGetOverrides();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getOverrides()} />
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
      {isDefined(overrides) ? (
        overrides.map(override => {
          return (
            <div key={override.id} data-testid="override">
              {override.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-overrides" />
      )}
    </div>
  );
};

describe('useLazyGetOverrides tests', () => {
  test('should query overrides after user interaction', async () => {
    const [mock, resultFunc] = createGetOverridesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetLazyOverridesComponent />);

    let overrideElements = screen.queryAllByTestId('override');
    expect(overrideElements).toHaveLength(0);

    expect(screen.queryByTestId('no-overrides')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    overrideElements = screen.getAllByTestId('override');
    expect(overrideElements).toHaveLength(2);

    expect(overrideElements[0]).toHaveTextContent('0815');
    expect(overrideElements[1]).toHaveTextContent('174');

    expect(screen.queryByTestId('no-overrides')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
