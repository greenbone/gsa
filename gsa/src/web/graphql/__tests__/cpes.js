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

import {rendererWith, fireEvent, screen, wait} from 'web/utils/testing';
import {
  useLazyGetCpes,
  useLazyGetCpe,
  useGetCpe,
  useExportCpesByIds,
  useExportCpesByFilter,
} from '../cpes';
import {
  createGetCpesQueryMock,
  createGetCpeQueryMock,
  createExportCpesByIdsQueryMock,
  createExportCpesByFilterQueryMock,
} from '../__mocks__/cpes';

const GetLazyCpesComponent = () => {
  const [getCpes, {counts, loading, cpes}] = useLazyGetCpes();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getCpes()} />
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
      {isDefined(cpes) ? (
        cpes.map(cpe => {
          return (
            <div key={cpe.id} data-testid="cpe">
              {cpe.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-cpes" />
      )}
    </div>
  );
};

describe('useLazyGetCpes tests', () => {
  test('should query cpes after user interaction', async () => {
    const [mock, resultFunc] = createGetCpesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyCpesComponent />);

    let cpeElements = screen.queryAllByTestId('cpe');
    expect(cpeElements).toHaveLength(0);

    expect(screen.queryByTestId('no-cpes')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    cpeElements = screen.queryAllByTestId('cpe');
    expect(cpeElements).toHaveLength(1);

    expect(cpeElements[0]).toHaveTextContent('cpe:/a:foo');

    expect(screen.queryByTestId('no-cpes')).not.toBeInTheDocument();

    await wait();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

const GetLazyCpeComponent = () => {
  const [getCpe, {cpe, loading}] = useLazyGetCpe();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getCpe('cpe:/a:foo')} />
      {isDefined(cpe) ? (
        <div key={cpe.id} data-testid="cpe">
          {cpe.id}
        </div>
      ) : (
        <div data-testid="no-cpe" />
      )}
    </div>
  );
};

describe('useLazyGetCpe tests', () => {
  test('should query cpe after user interaction', async () => {
    const [mock, resultFunc] = createGetCpeQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyCpeComponent />);

    let cpeElement = screen.queryAllByTestId('cpe');
    expect(cpeElement).toHaveLength(0);

    expect(screen.queryByTestId('no-cpe')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    cpeElement = screen.getByTestId('cpe');

    expect(cpeElement).toHaveTextContent('cpe:/a:foo');

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});

const GetCpeComponent = ({id}) => {
  const {loading, cpe, error} = useGetCpe(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {cpe && (
        <div data-testid="cpe">
          <span data-testid="id">{cpe.id}</span>
          <span data-testid="name">{cpe.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetCpe tests', () => {
  test('should load cpe', async () => {
    const [queryMock, resultFunc] = createGetCpeQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetCpeComponent id="cpe:/a:foo" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('cpe')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('cpe:/a:foo');
    expect(screen.getByTestId('name')).toHaveTextContent('foo');
  });
});

const ExportCpesByIdsComponent = () => {
  const exportCpesByIds = useExportCpesByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportCpesByIds(['cpe:/a:foo'])}
    />
  );
};

describe('useExportCpesByIds tests', () => {
  test('should export a list of cpes after user interaction', async () => {
    const [mock, resultFunc] = createExportCpesByIdsQueryMock(['cpe:/a:foo']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportCpesByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportCpesByFilterComponent = () => {
  const exportCpesByFilter = useExportCpesByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportCpesByFilter('foo')}
    />
  );
};

describe('useExportCpesByFilter tests', () => {
  test('should export a list of tasks by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportCpesByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportCpesByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});
