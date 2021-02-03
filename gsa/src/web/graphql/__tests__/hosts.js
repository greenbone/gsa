/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {rendererWith, screen, wait} from 'web/utils/testing';

import {createGetHostQueryMock} from '../__mocks__/hosts';
import {useGetHost} from '../hosts';

const GetHostComponent = ({id}) => {
  const {loading, host, error} = useGetHost(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {host && (
        <div data-testid="host">
          <span data-testid="id">{host.id}</span>
          <span data-testid="name">{host.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetHost tests', () => {
  test('should load host', async () => {
    const [queryMock, resultFunc] = createGetHostQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetHostComponent id="12345" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('host')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('12345');
    expect(screen.getByTestId('name')).toHaveTextContent('Foo');
  });
});
