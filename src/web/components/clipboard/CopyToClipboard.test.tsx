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

function setupClipboardMock() {
  Object.defineProperty(navigator, 'clipboard', {
    value: {writeText},
    writable: true,
    configurable: true,
  });
  writeText.mockResolvedValue(undefined);
}

describe('CopyToClipboard', () => {
  beforeEach(() => {
    testing.useFakeTimers();
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
    setupClipboardMock();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(writeText).toHaveBeenCalledWith('hello world');
  });

  test('calls writeText exactly once per click', async () => {
    render(<CopyToClipboard value="test value" />);
    setupClipboardMock();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(writeText).toHaveBeenCalledTimes(1);
  });

  test('resets copied state after 2 seconds', async () => {
    render(<CopyToClipboard value="test" />);
    setupClipboardMock();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await act(async () => {
      testing.advanceTimersByTime(2000);
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(writeText).toHaveBeenCalledTimes(2);
  });

  test('does not reset copied state before 2 seconds have elapsed', async () => {
    render(<CopyToClipboard value="test" />);
    setupClipboardMock();

    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    await act(async () => {
      testing.advanceTimersByTime(1999);
    });

    expect(writeText).toHaveBeenCalledTimes(1);
  });
});
