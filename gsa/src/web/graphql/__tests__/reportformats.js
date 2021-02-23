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

import {fireEvent, rendererWith, screen, wait} from 'web/utils/testing';
import {useGetReportFormats, useLazyGetReportFormats} from '../reportformats';
import {createGetReportFormatsQueryMock} from '../__mocks__/reportformats';

const GetReportFormatsComponent = () => {
  const {counts, loading, reportFormats} = useGetReportFormats();
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <div data-testid="counts">
        <span data-testid="total">{counts.all}</span>
        <span data-testid="filtered">{counts.filtered}</span>
        <span data-testid="offset">{counts.first}</span>
        <span data-testid="limit">{counts.rows}</span>
        <span data-testid="length">{counts.length}</span>
      </div>
      {reportFormats.map(format => {
        return (
          <div key={format.id} data-testid="reportformat">
            {format.name}
          </div>
        );
      })}
    </div>
  );
};

describe('useGetReportFormats tests', () => {
  test('should query useGetReportFormats', async () => {
    const [mock, resultFunc] = createGetReportFormatsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<GetReportFormatsComponent />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    const reportFormatElements = screen.getAllByTestId('reportformat');
    expect(reportFormatElements).toHaveLength(2);

    expect(reportFormatElements[0]).toHaveTextContent('foo');
    expect(reportFormatElements[1]).toHaveTextContent('bar');

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('offset')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});

const GetLazyReportFormatsComponent = () => {
  const [
    getReportFormats,
    {counts, loading, reportFormats},
  ] = useLazyGetReportFormats();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getReportFormats()} />
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
      {isDefined(reportFormats) ? (
        reportFormats.map(reportFormat => {
          return (
            <div key={reportFormat.id} data-testid="reportFormat">
              {reportFormat.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-reportFormats" />
      )}
    </div>
  );
};

describe('useLazyGetReportFormats tests', () => {
  test('should query reportFormats after user interaction', async () => {
    const [mock, resultFunc] = createGetReportFormatsQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyReportFormatsComponent />);

    let reportFormatElements = screen.queryAllByTestId('reportFormat');
    expect(reportFormatElements).toHaveLength(0);

    expect(screen.queryByTestId('no-reportFormats')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    reportFormatElements = screen.getAllByTestId('reportFormat');
    expect(reportFormatElements).toHaveLength(2);

    expect(reportFormatElements[0]).toHaveTextContent('665');
    expect(reportFormatElements[1]).toHaveTextContent('789');

    expect(screen.queryByTestId('no-reportFormats')).not.toBeInTheDocument();

    await wait();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
