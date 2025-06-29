/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {act, fireEvent, render, screen} from 'web/testing';
import useReload from 'web/hooks/useReload';

const TestComponent = ({reload, timeout}) => {
  const [startTimer, clearTimer, isRunning] = useReload(reload, timeout);
  return (
    <>
      <button data-testid="startTimer" onClick={startTimer}></button>
      <button data-testid="clearTimer" onClick={clearTimer}></button>
      <span data-testid="isRunning">{String(isRunning)}</span>
    </>
  );
};

const runTimers = async () => {
  await act(async () => {
    await testing.advanceTimersToNextTimerAsync();
  });
};

describe('useTiming', () => {
  test('should start a timer to reload', async () => {
    testing.useFakeTimers();

    const reload = testing.fn();
    const timeout = testing.fn().mockImplementation(() => 900);

    render(<TestComponent reload={reload} timeout={timeout} />);

    const isRunning = screen.getByTestId('isRunning');

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(isRunning).toHaveTextContent('true');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    timeout.mockClear();

    await runTimers();

    expect(isRunning).toHaveTextContent('false');
    expect(reload).toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
  });

  test('should reload forever', async () => {
    testing.useFakeTimers();

    const reload = testing.fn().mockResolvedValue(undefined);
    const timeout = testing.fn().mockImplementation(() => 900);

    render(<TestComponent reload={reload} timeout={timeout} />);

    const isRunning = screen.getByTestId('isRunning');

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(isRunning).toHaveTextContent('true');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    timeout.mockClear();

    await runTimers();

    expect(isRunning).toHaveTextContent('true');
    expect(reload).toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    timeout.mockClear();
    reload.mockClear();

    await runTimers();

    expect(isRunning).toHaveTextContent('true');
    expect(reload).toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});
  });

  test('should not reload if loading fails', async () => {
    testing.useFakeTimers();

    const reload = testing.fn().mockRejectedValue(new Error('Loading failed'));
    const timeout = testing.fn().mockImplementation(() => 900);

    render(<TestComponent reload={reload} timeout={timeout} />);

    const isRunning = screen.getByTestId('isRunning');

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(isRunning).toHaveTextContent('true');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    timeout.mockClear();

    await runTimers();

    expect(isRunning).toHaveTextContent('false');
    expect(reload).toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
  });

  test('should allow to cancel reload', async () => {
    testing.useFakeTimers();

    const reload = testing.fn().mockResolvedValue(undefined);
    const timeout = testing.fn().mockImplementation(() => 900);

    render(<TestComponent reload={reload} timeout={timeout} />);

    const isRunning = screen.getByTestId('isRunning');

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(isRunning).toHaveTextContent('true');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    timeout.mockClear();

    await runTimers();

    expect(isRunning).toHaveTextContent('true');
    expect(reload).toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    timeout.mockClear();
    reload.mockClear();

    fireEvent.click(screen.getByTestId('clearTimer'));

    await runTimers();

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();
  });

  test('should not start reload reload timer', async () => {
    testing.useFakeTimers();

    const reload = testing.fn();
    const timeout = testing.fn();

    render(<TestComponent reload={reload} timeout={timeout} />);

    const isRunning = screen.getByTestId('isRunning');

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('startTimer'));

    expect(isRunning).toHaveTextContent('false');
    expect(reload).not.toHaveBeenCalled();
    expect(timeout).toHaveBeenCalledWith({isVisible: true});
  });
});
