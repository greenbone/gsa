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
import {render} from 'web/testing';
import date from 'gmp/models/date';
import SessionObserver from 'web/components/observer/SessionObserver';

const mockUseSessionTimeout = testing.fn();
const ping = testing.fn();

vi.mock('web/hooks/useSessionTimeout', () => ({
  __esModule: true,
  default: () => mockUseSessionTimeout(),
}));

vi.mock('web/hooks/useGmp', () => ({
  __esModule: true,
  default: () => ({user: {ping}}),
}));

const now = date('2025-01-01T00:00:00Z');
const sessionTimeout = date(now).add(1, 'minute');

const renderObserver = () => render(<SessionObserver />);

describe('SessionObserver tests', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    testing.useFakeTimers();
    testing.setSystemTime(now.toDate());
    mockUseSessionTimeout.mockReturnValue([sessionTimeout]);
    ping.mockResolvedValue(undefined);
  });

  afterEach(() => {
    testing.useRealTimers();
  });

  test('should render nothing when the session timeout is not defined', () => {
    mockUseSessionTimeout.mockReturnValue([undefined]);

    const {element} = renderObserver();

    expect(element).toBeNull();
    expect(ping).not.toHaveBeenCalled();
  });

  test('should ping after the session timeout and delay', () => {
    renderObserver();

    testing.advanceTimersByTime(60 * 1000 + 4999);
    expect(ping).not.toHaveBeenCalled();

    testing.advanceTimersByTime(1);
    expect(ping).toHaveBeenCalledTimes(1);
  });

  test('should clear the ping timer when unmounted', () => {
    const {unmount} = renderObserver();

    unmount();
    testing.advanceTimersByTime(60 * 1000 + 5000);

    expect(ping).not.toHaveBeenCalled();
  });

  test('should ignore ping errors', async () => {
    ping.mockRejectedValue(new Error('session expired'));
    renderObserver();

    testing.advanceTimersByTime(60 * 1000 + 5000);

    await expect(Promise.resolve()).resolves.toBeUndefined();
    expect(ping).toHaveBeenCalledTimes(1);
  });
});
