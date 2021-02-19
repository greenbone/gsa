/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {createGetReportQueryMock, mockReport} from '../__mocks__/reports';

import {useLazyGetReport} from '../reports';

const GetLazyReportComponent = () => {
  const [getReport, {report, loading}] = useLazyGetReport('1234');

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getReport()} />
      {isDefined(report) ? (
        <div key={report.id} data-testid="report">
          {report.id}
        </div>
      ) : (
        <div data-testid="no-report" />
      )}
    </div>
  );
};

describe('useLazyGetReport tests', () => {
  test('should query report after user interaction', async () => {
    const [mock, resultFunc] = createGetReportQueryMock('1234', mockReport);
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyReportComponent />);

    let reportElement = screen.queryAllByTestId('report');
    expect(reportElement).toHaveLength(0);

    expect(screen.queryByTestId('no-report')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    reportElement = screen.getByTestId('report');

    expect(reportElement).toHaveTextContent('1234');

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});
