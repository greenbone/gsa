/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {useState} from 'react';
import useTiming from 'web/hooks/useTiming';
import {act, fireEvent, render, screen} from 'web/testing';

const TestComponent = ({doFunc}) => {
  const [value, setValue] = useState(0);
  const timingFunc = () => {
    setValue(value => value + 1);
    return doFunc();
  };
  const [startTimer, clearTimer, isRunning] = useTiming(timingFunc, 900);
  return (
    <>
      <button data-testid="startTimer" onClick={startTimer}></button>
      <button data-testid="clearTimer" onClick={clearTimer}></button>
      <span data-testid="value">{value}</span>
      <span data-testid="isRunning">{'' + isRunning}</span>
    </>
  );
};

const runTimers = async () => {
  await act(async () => {
    await testing.advanceTimersToNextTimerAsync();
  });
};

describe('useTiming', () => {
  test('should start a timer', async () => {
    testing.useFakeTimers();
    const doFunc = testing.fn().mockImplementation(() => {});

    render(<TestComponent doFunc={doFunc} />);

    const value = screen.getByTestId('value');
    const isRunning = screen.getByTestId('isRunning');

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('false');

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('true');

    await runTimers();

    expect(screen.getByTestId('value')).toHaveTextContent('1');
    expect(screen.getByTestId('isRunning')).toHaveTextContent('false');
  });

  test('should keep running a timer when a promise is used', async () => {
    testing.useFakeTimers();
    const doFunc = testing.fn().mockResolvedValueOnce();

    render(<TestComponent doFunc={doFunc} />);

    const value = screen.getByTestId('value');
    const isRunning = screen.getByTestId('isRunning');

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('false');

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('true');

    await runTimers();

    expect(screen.getByTestId('value')).toHaveTextContent('1');
    expect(screen.getByTestId('isRunning')).toHaveTextContent('true');

    await runTimers();

    expect(screen.getByTestId('value')).toHaveTextContent('2');
    expect(screen.getByTestId('isRunning')).toHaveTextContent('false');
  });

  test('should not rerun timer when a promise fails', async () => {
    testing.useFakeTimers();
    const doFunc = testing.fn().mockRejectedValue();

    render(<TestComponent doFunc={doFunc} />);

    const value = screen.getByTestId('value');
    const isRunning = screen.getByTestId('isRunning');

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('false');

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('true');

    await runTimers();

    expect(screen.getByTestId('value')).toHaveTextContent('1');
    expect(screen.getByTestId('isRunning')).toHaveTextContent('false');
  });

  test('should allow to clear the timer', async () => {
    testing.useFakeTimers();
    const doFunc = testing.fn().mockResolvedValue();

    render(<TestComponent doFunc={doFunc} />);

    const value = screen.getByTestId('value');
    const isRunning = screen.getByTestId('isRunning');

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('false');

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(value).toHaveTextContent('0');
    expect(isRunning).toHaveTextContent('true');

    await runTimers();

    expect(screen.getByTestId('value')).toHaveTextContent('1');
    expect(screen.getByTestId('isRunning')).toHaveTextContent('true');

    fireEvent.click(screen.getByTestId('clearTimer'));

    expect(screen.getByTestId('value')).toHaveTextContent('1');
    expect(screen.getByTestId('isRunning')).toHaveTextContent('false');
  });
});
