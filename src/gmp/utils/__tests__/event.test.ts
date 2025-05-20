/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {debounce, throttleAnimation} from 'gmp/utils/event';

// @vitest-environment jsdom

describe('debounce function tests', () => {
  testing.useFakeTimers();

  test('should debounce function', () => {
    const callback = testing.fn();
    const func = debounce(callback);

    func(1);
    func(2);
    func(3);

    testing.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(3);
  });

  test('should run callback immediately', () => {
    const callback = testing.fn();
    const func = debounce(callback, 10000, true);

    func(1);
    func(2);
    func(3);

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(1);

    testing.runAllTimers();

    expect(callback.mock.calls.length).toBe(2);
    expect(callback.mock.calls[1][0]).toBe(3);
  });
});

describe('throttleAnimation function tests', () => {
  testing.useFakeTimers();

  test('should throttle running callback', () => {
    global.requestAnimationFrame = cb => setTimeout(cb, 0);

    const callback = testing.fn();
    const func = throttleAnimation(callback);

    func(1);
    func(2);
    func(3);

    testing.runAllTimers();

    expect(callback).toBeCalled();
    expect(callback.mock.calls.length).toBe(1);
    expect(callback.mock.calls[0][0]).toBe(1);
  });
});
