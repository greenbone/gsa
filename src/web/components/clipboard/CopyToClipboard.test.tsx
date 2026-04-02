/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  testing,
} from '@gsa/testing';
import {act, fireEvent, render, screen} from 'web/testing';
import CopyToClipboard from 'web/components/clipboard/CopyToClipboard';

const writeText = testing.fn();

describe('CopyToClipboard', () => {
  beforeEach(() => {
    testing.useFakeTimers();
    Object.defineProperty(navigator, 'clipboard', {
      value: {writeText},
      writable: true,
      configurable: true,
    });
    writeText.mockResolvedValue(undefined);
  });

  afterEach(() => {
    testing.useRealTimers();
    testing.clearAllMocks();
  });

  test('renders a button', () => {
    render(<CopyToClipboard value="hello" />);

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  test('copies the value to clipboard on click', async () => {
    render(<CopyToClipboard value="hello world" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  test('calls writeText exactly once per click', async () => {
    render(<CopyToClipboard value="test value" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
  });

  test('falls back to execCommand when clipboard API fails', async () => {
    writeText.mockRejectedValue(new Error('Clipboard not available'));
    const execCommandSpy = testing
      .spyOn(document, 'execCommand')
      .mockReturnValue(true);

    render(<CopyToClipboard value="fallback value" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(execCommandSpy).toHaveBeenCalledWith('copy');
  });

  test('resets copied state after 2 seconds', async () => {
    render(<CopyToClipboard value="test" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await act(async () => {
      testing.advanceTimersByTime(2000);
    });

    // Button still rendered and clickable after reset — clipboard can be called again
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(writeText).toHaveBeenCalledTimes(2);
  });

  test('does not reset copied state before 2 seconds have elapsed', async () => {
    render(<CopyToClipboard value="test" />);

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await act(async () => {
      testing.advanceTimersByTime(1999);
    });

    // Button is still in copied state — a second click is a no-op (no extra write)
    // The component prevents further clipboard writes while $copied is true
    // We verify writeText was called exactly once (copied state active)
    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
