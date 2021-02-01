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

import React, {useState, useCallback, useEffect} from 'react';

import {rendererWith, screen, act, fireEvent, wait} from '../testing';

import useTiming from '../useTiming';

const TestComponent = ({onMount = false, timeout = 100, promise = false}) => {
  const [value, setValue] = useState(0);

  const stateUpdate = useCallback(() => setValue(val => val + 1), []);

  const stateUpdatePromise = useCallback(
    () => Promise.resolve().then(() => setValue(val => val + 1)),
    [],
  );

  const [startTimer, clearTimer, isRunning] = useTiming(
    promise ? stateUpdatePromise : stateUpdate,
    timeout,
  );

  useEffect(() => {
    if (onMount) {
      startTimer();
    }
  }, [startTimer]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div>
      <button data-testid="start" onClick={startTimer} />
      <button data-testid="stop" onClick={clearTimer} />
      <div data-testid="value">{value}</div>
      <div data-testid="isRunning">{isRunning ? 'yes' : 'no'}</div>
    </div>
  );
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('useTiming tests', () => {
  test('should start a timer during mount', async () => {
    const {render} = rendererWith();

    render(<TestComponent onMount={true} />);

    expect(screen.getByTestId('value')).toHaveTextContent(0);

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('value')).toHaveTextContent(1);
  });

  test('should start a timer manually', async () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.getByTestId('value')).toHaveTextContent(0);

    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('value')).toHaveTextContent(1);

    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('value')).toHaveTextContent(2);
  });

  test('should allow to calculate the timeout', async () => {
    const {render} = rendererWith();

    const timeout = () => 666;

    render(<TestComponent timeout={timeout} />);

    expect(screen.getByTestId('value')).toHaveTextContent(0);

    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('value')).toHaveTextContent(1);
  });

  test('should allow to clear the timeout', async () => {
    const {render} = rendererWith();

    const timeout = () => 666;

    render(<TestComponent timeout={timeout} />);

    expect(screen.getByTestId('value')).toHaveTextContent(0);

    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('value')).toHaveTextContent(1);

    fireEvent.click(screen.getByTestId('start'));

    fireEvent.click(screen.getByTestId('stop'));

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(screen.getByTestId('value')).toHaveTextContent(1);
  });

  test('should restart timer after promise is successful', async () => {
    jest.useRealTimers();

    const {render} = rendererWith();

    render(<TestComponent promise={true} onMount={true} />);

    expect(screen.getByTestId('isRunning')).toHaveTextContent('no');
    expect(screen.getByTestId('value')).toHaveTextContent(0);

    await wait(100);

    expect(screen.getByTestId('isRunning')).toHaveTextContent('yes');
    expect(screen.getByTestId('value')).toHaveTextContent(1);

    await wait(100);

    expect(screen.getByTestId('isRunning')).toHaveTextContent('yes');
    expect(screen.getByTestId('value')).toHaveTextContent(2);
  });

  test('should not start timer if timeout value is null', async () => {
    const {render} = rendererWith();

    render(<TestComponent onMount={true} timeout={null} />);

    expect(screen.getByTestId('value')).toHaveTextContent(0);

    expect(screen.getByTestId('value')).toHaveTextContent(0);
    expect(screen.getByTestId('isRunning')).toHaveTextContent('no');
  });
});
