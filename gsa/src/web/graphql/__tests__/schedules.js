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

import {useLazyGetSchedules, useGetSchedule} from '../schedules';

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

const GetScheduleComponent = ({id}) => {
  const {loading, schedule, error} = useGetSchedule(id);
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <div data-testid="error">{error.message}</div>}
      {schedule && (
        <div data-testid="schedule">
          <span data-testid="id">{schedule.id}</span>
          <span data-testid="name">{schedule.name}</span>
          <span data-testid="icalendar">{schedule.icalendar}</span>
        </div>
      )}
    </div>
  );
};

describe('useGetSchedule tests', () => {
  test('should load schedule', async () => {
    const id = '42';
    const [queryMock, resultFunc] = createGetScheduleQueryMock(id);

    const {render} = rendererWith({queryMocks: [queryMock]});

    render(<GetScheduleComponent id={id} />);

    expect(screen.queryByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error')).not.toBeInTheDocument();

    expect(screen.getByTestId('schedule')).toBeInTheDocument();

    expect(screen.getByTestId('id')).toHaveTextContent('42');
    expect(screen.getByTestId('name')).toHaveTextContent('schedule 1');
    expect(screen.getByTestId('icalendar')).toHaveTextContent(
      'c35f82f1-7798-4b84-b2c4-761a33068956',
    );
  });
});

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

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    scheduleElements = screen.getAllByTestId('schedule');
    expect(scheduleElements).toHaveLength(2);

    expect(scheduleElements[0]).toHaveTextContent('42');
    expect(scheduleElements[1]).toHaveTextContent('1337');

    expect(screen.queryByTestId('no-schedules')).not.toBeInTheDocument();

    expect(screen.getByTestId('total')).toHaveTextContent(2);
    expect(screen.getByTestId('filtered')).toHaveTextContent(2);
    expect(screen.getByTestId('first')).toHaveTextContent(1);
    expect(screen.getByTestId('limit')).toHaveTextContent(10);
    expect(screen.getByTestId('length')).toHaveTextContent(2);
  });
});
