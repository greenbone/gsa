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
  useLazyGetCves,
  useLazyGetCve,
  useGetCve,
  useExportCvesByIds,
  useExportCvesByFilter,
} from '../cves';
import {
  createGetCvesQueryMock,
  createGetCveQueryMock,
  createExportCvesByIdsQueryMock,
  createExportCvesByFilterQueryMock,
} from '../__mocks__/cves';

const GetLazyCvesComponent = () => {
  const [getCves, {counts, loading, cves}] = useLazyGetCves();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getCves()} />
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
      {isDefined(cves) ? (
        cves.map(cve => {
          return (
            <div key={cve.id} data-testid="cve">
              {cve.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-cves" />
      )}
    </div>
  );
};

describe('useLazyGetCves tests', () => {
  test('should query cves after user interaction', async () => {
    const [mock, resultFunc] = createGetCvesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyCvesComponent />);

    let cveElements = screen.queryAllByTestId('cve');
    expect(cveElements).toHaveLength(0);

    expect(screen.queryByTestId('no-cves')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    cveElements = screen.queryAllByTestId('cve');
    expect(cveElements).toHaveLength(1);

    expect(cveElements[0]).toHaveTextContent('CVE-314');

    expect(screen.queryByTestId('no-cves')).not.toBeInTheDocument();

    await wait();

    expect(screen.getByTestId('total')).toHaveTextContent(1);
    expect(screen.getByTestId('filtered')).toHaveTextContent(1);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(1);
  });
});

const GetLazyCveComponent = () => {
  const [getCve, {cve, loading}] = useLazyGetCve();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getCve('CVE-314')} />
      {isDefined(cve) ? (
        <div key={cve.id} data-testid="cve">
          {cve.id}
        </div>
      ) : (
        <div data-testid="no-cve" />
      )}
    </div>
  );
};

describe('useLazyGetCve tests', () => {
  test('should query cve after user interaction', async () => {
    const [mock, resultFunc] = createGetCveQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyCveComponent />);

    let cveElement = screen.queryAllByTestId('cve');
    expect(cveElement).toHaveLength(0);

    expect(screen.queryByTestId('no-cve')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    cveElement = screen.getByTestId('cve');

    expect(cveElement).toHaveTextContent('CVE-314');

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});

const GetCveComponent = ({id}) => {
  const {loading, cve, error} = useGetCve(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {cve && (
        <div data-testid="cve">
          <span data-testid="id">{cve.id}</span>
          <span data-testid="name">{cve.name}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetCve tests', () => {
  test('should load cve', async () => {
    const [queryMock, resultFunc] = createGetCveQueryMock();

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetCveComponent id="CVE-314" />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('cve')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('CVE-314');
    expect(screen.getByTestId('name')).toHaveTextContent('CVE-314');
  });
});

const ExportCvesByIdsComponent = () => {
  const exportCvesByIds = useExportCvesByIds();
  return (
    <button
      data-testid="bulk-export"
      onClick={() => exportCvesByIds(['CVE-314'])}
    />
  );
};

describe('useExportCvesByIds tests', () => {
  test('should export a list of cves after user interaction', async () => {
    const [mock, resultFunc] = createExportCvesByIdsQueryMock(['CVE-314']);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportCvesByIdsComponent />);
    const button = screen.getByTestId('bulk-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});

const ExportCvesByFilterComponent = () => {
  const exportCvesByFilter = useExportCvesByFilter();
  return (
    <button
      data-testid="filter-export"
      onClick={() => exportCvesByFilter('foo')}
    />
  );
};

describe('useExportCvesByFilter tests', () => {
  test('should export a list of tasks by filter string after user interaction', async () => {
    const [mock, resultFunc] = createExportCvesByFilterQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<ExportCvesByFilterComponent />);
    const button = screen.getByTestId('filter-export');
    fireEvent.click(button);

    await wait();

    expect(resultFunc).toHaveBeenCalled();
  });
});
