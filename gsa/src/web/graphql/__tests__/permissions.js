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
/* eslint-disable react/prop-types */
import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, screen, wait} from 'web/utils/testing';
import {useGetPermissions} from '../permissions';
import {createGetPermissionsQueryMock} from '../__mocks__/permissions';

const GetPermissionsComponent = () => {
  const {counts, permissions} = useGetPermissions();
  return (
    <div>
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
      {isDefined(permissions) ? (
        permissions.map(permission => {
          return (
            <div key={permission.id} data-testid="permission">
              {permission.name}
            </div>
          );
        })
      ) : (
        <div data-testid="no-permission" />
      )}
    </div>
  );
};

describe('useGetPermission tests', () => {
  test('should query permissions', async () => {
    const [mock, resultFunc] = createGetPermissionsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetPermissionsComponent />);
    await wait();

    const permissionElements = screen.queryAllByTestId('permission');
    expect(permissionElements).toHaveLength(2);

    expect(resultFunc).toHaveBeenCalled();

    expect(permissionElements[0]).toHaveTextContent('get_foo');
    expect(permissionElements[1]).toHaveTextContent('get_bar');

    const noPermissions = screen.queryByTestId('no-permission');
    expect(noPermissions).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
