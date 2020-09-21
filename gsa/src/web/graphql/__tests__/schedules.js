/* Copyright (C) 2020 Greenbone Networks GmbH
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

import {useLazyGetSchedules, useLazyGetSchedule} from '../schedules';

import {
  createGetSchedulesQueryMock,
  createGetScheduleQueryMock,
} from '../__mocks__/schedules';

/* eslint-disable react/prop-types */

const GetLazySchedulesComponent = () => {
  const [getSchedules, {counts, loading, schedules}] = useLazyGetSchedules();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getSchedules()} />
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
      {isDefined(schedules) ? (
        schedules.map(schedule => {
          return (
            <div key={schedule.id} data-testid="schedule">
              {schedule.id}
            </div>
          );
        })
      ) : (
        <div data-testid="no-schedules" />
      )}
    </div>
  );
};

const GetLazyScheduleComponent = () => {
  const [getSchedule, {schedule, loading}] = useLazyGetSchedule();

  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      <button data-testid="load" onClick={() => getSchedule()} />
      {isDefined(schedule) ? (
        <div key={schedule.id} data-testid="schedule">
          {schedule.id}
        </div>
      ) : (
        <div data-testid="no-schedule" />
      )}
    </div>
  );
};

describe('useLazyGetSchedules tests', () => {
  test('should query schedules after user interaction', async () => {
    const [mock, resultFunc] = createGetSchedulesQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazySchedulesComponent />);

    let scheduleElements = screen.queryAllByTestId('schedule');
    expect(scheduleElements).toHaveLength(0);

    expect(screen.queryByTestId('no-schedules')).toBeInTheDocument();
    expect(screen.queryByTestId('no-counts')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scheduleElements = screen.getAllByTestId('schedule');
    expect(scheduleElements).toHaveLength(4);

    expect(scheduleElements[0]).toHaveTextContent(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );
    expect(scheduleElements[1]).toHaveTextContent(
      'c35f82f1-7798-4b84-b2c4-761a33068957',
    );

    expect(screen.queryByTestId('no-schedules')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(4);
    expect(screen.getByTestId('filtered')).toHaveTextContent(4);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(4);
  });
});

describe('useLazyGetSchedule tests', () => {
  test('should query schedule after user interaction', async () => {
    const [mock, resultFunc] = createGetScheduleQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});
    render(<GetLazyScheduleComponent />);

    let scheduleElement = screen.queryAllByTestId('schedule');
    expect(scheduleElement).toHaveLength(0);

    expect(screen.queryByTestId('no-schedule')).toBeInTheDocument();

    const button = screen.getByTestId('load');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scheduleElement = screen.getByTestId('schedule');

    expect(scheduleElement).toHaveTextContent(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });
});
