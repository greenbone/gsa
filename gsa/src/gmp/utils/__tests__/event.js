/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
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
import {debounce, throttleAnimation} from '../event';

describe('debounce function tests', () => {

  jest.useFakeTimers();

  test('should debounce function', () => {
    const callback = jest.fn();
    const func = debounce(callback);

    func(1);
    func(2);
    func(3);

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(3);
  });

  test('should run callback immediately', () => {
    const callback = jest.fn();
    const func = debounce(callback, 10000, true);

    func(1);
    func(2);
    func(3);

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(1);

    jest.runAllTimers();

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0]).toBe(3);
  });
});

describe('throttleAnimation function tests', () => {

  jest.useFakeTimers();

  test('should throttle running callback', () => {
    const callback = jest.fn();
    const func = throttleAnimation(callback);

    func(1);
    func(2);
    func(3);

    jest.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(1);
  });
});

// vim: set ts=2 sw=2 tw=80:
