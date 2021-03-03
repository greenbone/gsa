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
/* eslint-disable react/prop-types */

import React from 'react';

import {isDefined} from 'gmp/utils/identity';

import {rendererWith, fireEvent, wait, screen} from 'web/utils/testing';

import {
  createGetNvtsQueryMock,
  createGetNvtQueryMock,
  createExportNvtsByIdsQueryMock,
  createExportNvtsByFilterQueryMock,
  mockNvt,
} from '../__mocks__/nvts';

import {
  useLazyGetNvts,
  useLazyGetNvt,
  useExportNvtsByFilter,
  useExportNvtsByIds,
  useGetNvt,
} from '../nvts';

const GetLazyNvtsComponent = () => {
  const [getNvts, {counts, loading, nvts}] = useLazyGetNvts();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getNvts()} />
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
      {isDefined(nvts) ? (
        nvts.map(nvt => {
          return (
            <div key={nvt.id} data-testid="nvt">
              {nvt.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-nvts" />
      )}
    </div>
  );
};

const GetLazyNvtComponent = () => {
  const [getNvt, {nvt, loading}] = useLazyGetNvt('12345');

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getNvt()} />
      {isDefined(nvt) ? (
        <div key={nvt.id} data-testid="nvt">
          {nvt.id}
        </div>
      ) : (
        <div data-testid="no-nvt" />
      )}
    </div>
  );
};

describe('useLazyGetNvts tests', () => {
  test('should query nvts after user interaction', async () => {
    const [mock, resultFunc] = createGetNvtsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyNvtsComponent />);

    let nvtElements = screen.queryAllByTestId('nvt');
    expect(nvtElements).toHaveLength(0);

    expect(screen.queryByTestId('no-nvts')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    nvtElements = screen.getAllByTestId('nvt');
    expect(nvtElements).toHaveLength(1);

    expect(nvtElements[0]).toHaveTextContent('12345');

    expect(screen.queryByTestId('no-nvts')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

describe('useLazyGetNvt tests', () => {
  test('should query nvt after user interaction', async () => {
    const [mock, resultFunc] = createGetNvtQueryMock('12345', mockNvt);
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyNvtComponent />);

    let nvtElement = screen.queryAllByTestId('nvt');
    expect(nvtElement).toHaveLength(0);

    expect(screen.queryByTestId('no-nvt')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    nvtElement = screen.getByTestId('nvt');

    expect(nvtElement).toHaveTextContent('12345');

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});

const ExportNvtsByIdsComponent = () => {
  const exportNvtsByIds = useExportNvtsByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportNvtsByIds(['12345'])}
    />
  );
};

describe('useExportNvtsByIds tests', () => {
  test('should export a list of nvts after user interaction', async () => {
    const [mock, resultFunc] = createExportNvtsByIdsQueryMock(['12345']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportNvtsByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportNvtsByFilterComponent = () => {
  const exportNvtsByFilter = useExportNvtsByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportNvtsByFilter('12345')}
    />
  );
};

describe('useExportNvtsByFilter tests', () => {
  test('should export a list of nvts by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportNvtsByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportNvtsByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const GetNvtComponent = ({id}) => {
  const {loading, nvt, error} = useGetNvt(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {nvt && (
        <div data-testid="nvt">
          <span data-testid="id">{nvt.id}</span>
          <span data-testid="name">{nvt.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetNvt tests', () => {
  test('should load nvt', async () => {
    const [queryMock, resultFunc] = createGetNvtQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetNvtComponent id="12345" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('nvt')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('12345');
    expect(screen.getByTestId('name')).toHaveTextContent('12345');
  });
});
