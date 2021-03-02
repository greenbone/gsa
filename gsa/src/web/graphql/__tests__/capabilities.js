/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

/* eslint-disable react/prop-types */

import React from 'react';

import {rendererWith, screen, wait} from 'web/utils/testing';

import {useGetCapabilities} from '../capabilities';
import {createGetCapabilitiesQueryMock} from '../__mocks__/capabilities';

const TestComponent = () => {
  const {capabilities, loading, error} = useGetCapabilities();
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  if (error) {
    return <span data-testid="error">{error}</span>;
  }
  return (
    <div>
      {capabilities.map(capability => {
        return (
          <div key={capability} data-testid="capability">
            {capability}
          </div>
        );
      })}
    </div>
  );
};

describe('useGetCapabilities tests', () => {
  test('should query capabilities', async () => {
    const capList = ['get_tasks', 'create_task', 'delete_task', 'modify_task'];
    const [mock, resultFunc] = createGetCapabilitiesQueryMock(capList);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestComponent />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const capabilityElements = screen.getAllByTestId('capability');
    expect(capabilityElements).toHaveLength(4);

    expect(capabilityElements[0]).toHaveTextContent('get_tasks');
    expect(capabilityElements[1]).toHaveTextContent('create_task');
    expect(capabilityElements[2]).toHaveTextContent('delete_task');
    expect(capabilityElements[3]).toHaveTextContent('modify_task');
  });
});
