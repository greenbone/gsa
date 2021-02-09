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

import {isDefined} from 'gmp/utils/identity';

import {fireEvent, rendererWith, screen, wait} from 'web/utils/testing';

import {
  createGetHostQueryMock,
  createGetHostsQueryMock,
  createDeleteHostsByIdsQueryMock,
  createDeleteHostsByFilterQueryMock,
  createDeleteHostQueryMock,
  createExportHostsByIdsQueryMock,
  createExportHostsByFilterQueryMock,
} from '../__mocks__/hosts';
import {
  useDeleteHost,
  useDeleteHostsByIds,
  useDeleteHostsByFilter,
  useExportHostsByIds,
  useExportHostsByFilter,
  useGetHost,
  useLazyGetHosts,
} from '../hosts';

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

const GetLazyHostsComponent = () => {
  const [getHosts, {counts, loading, hosts}] = useLazyGetHosts();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getHosts()} />
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
      {isDefined(hosts) ? (
        hosts.map(host => {
          return (
            <div key={host.id} data-testid="host">
              {host.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-hosts" />
      )}
    </div>
  );
};

describe('useLazyGetHosts tests', () => {
  test('should query hosts after user interaction', async () => {
    const [mock, resultFunc] = createGetHostsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyHostsComponent />);

    let hostElements = screen.queryAllByTestId('host');
    expect(hostElements).toHaveLength(0);

    expect(screen.queryByTestId('no-hosts')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    hostElements = screen.getAllByTestId('host');
    expect(hostElements).toHaveLength(1);

    expect(hostElements[0]).toHaveTextContent('12345');

    expect(screen.queryByTestId('no-hosts')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

const ExportHostsByIdsComponent = () => {
  const exportHostsByIds = useExportHostsByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportHostsByIds(['234'])}
    />
  );
};

describe('useExportHostsByIds tests', () => {
  test('should export a list of hosts after user interaction', async () => {
    const [mock, resultFunc] = createExportHostsByIdsQueryMock(['234']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportHostsByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportHostsByFilterComponent = () => {
  const exportHostsByFilter = useExportHostsByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportHostsByFilter('foo')}
    />
  );
};

describe('useExportHostsByFilter tests', () => {
  test('should export a list of hosts by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportHostsByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportHostsByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteHostsByIdsComponent = () => {
  const [deleteHostsByIds] = useDeleteHostsByIds();
  return (
    <button
      data-testid="bulk-delete"
      onClick={() => deleteHostsByIds(['foo', 'bar'])}
    />
  );
};

describe('useDeleteHostsByIds tests', () => {
  test('should delete a list of hosts after user interaction', async () => {
    const [mock, resultFunc] = createDeleteHostsByIdsQueryMock(['foo', 'bar']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteHostsByIdsComponent />);
    const button = screen.getByTestId('bulk-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteHostsByFilterComponent = () => {
  const [deleteHostsByFilter] = useDeleteHostsByFilter();
  return (
    <button
      data-testid="filter-delete"
      onClick={() => deleteHostsByFilter('foo')}
    />
  );
};

describe('useDeleteHostsByFilter tests', () => {
  test('should delete a list of hosts by filter string after user interaction', async () => {
    const [mock, resultFunc] = createDeleteHostsByFilterQueryMock('foo');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteHostsByFilterComponent />);
    const button = screen.getByTestId('filter-delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const DeleteHostComponent = () => {
  const [deleteHost] = useDeleteHost();
  return <button data-testid="delete" onClick={() => deleteHost('234')} />;
};

describe('useDeleteHostsByIds tests', () => {
  test('should delete a list of hosts after user interaction', async () => {
    const [mock, resultFunc] = createDeleteHostQueryMock('234');
    const {render} = rendererWith({queryMocks: [mock]});

    render(<DeleteHostComponent />);
    const button = screen.getByTestId('delete');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});
