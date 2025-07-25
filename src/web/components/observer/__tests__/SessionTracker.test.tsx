/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {beforeEach, describe, expect, test, testing} from '@gsa/testing';
import {render} from 'web/testing';
import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {vi} from 'vitest';
import date from 'gmp/models/date';
import SessionTracker, {
  NOTIFICATION_TIMEOUT,
} from 'web/components/observer/SessionTracker';

vi.mock('@greenbone/opensight-ui-components-mantinev7', () => ({
  showNotification: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ThemeProvider: ({children}) => children,
  theme: {
    colorScheme: 'light',
  },
}));

vi.mock('web/hooks/useSessionTracker', () => ({
  __esModule: true,
  default: testing.fn(),
}));

const mockUseUserSessionTimeout = testing.fn();

vi.mock('web/hooks/useUserSessionTimeout', () => ({
  __esModule: true,
  default: () => mockUseUserSessionTimeout(),
}));

const now = date('2025-01-01T00:00:00Z');
const sessionTimeout = date(now).add(10, 'minutes');

describe('SessionTracker', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    mockUseUserSessionTimeout.mockReturnValue([sessionTimeout, testing.fn()]);
  });

  test('shows notification when session is about to expire', () => {
    testing.useFakeTimers();

    const sessionTimeout = date(now).add(NOTIFICATION_TIMEOUT, 'minutes');
    mockUseUserSessionTimeout.mockReturnValue([sessionTimeout, testing.fn()]);

    render(<SessionTracker />);

    testing.advanceTimersByTime(1000);

    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'session-expiration-warning',
        autoClose: false,
        title: 'You have been inactive, your session will expire in 3 minutes',
        message: '',
      }),
    );
  });

  test('does not show notification if session timeout is not set', () => {
    mockUseUserSessionTimeout.mockReturnValue([null, testing.fn()]);

    render(<SessionTracker />);

    expect(showNotification).not.toHaveBeenCalled();
  });

  test('does not show notification if session expires in more than NOTIFICATION_TIMEOUT minutes', () => {
    testing.useFakeTimers();

    testing.setSystemTime(now.toDate());

    render(<SessionTracker />);

    // Advance time by (NOTIFICATION_TIMEOUT + 2) minutes (still 2 minutes before NOTIFICATION_TIMEOUT)
    testing.advanceTimersByTime((NOTIFICATION_TIMEOUT + 2) * 60 * 1000);

    expect(showNotification).not.toHaveBeenCalled();
  });

  test('shows notification exactly at NOTIFICATION_TIMEOUT minutes before session timeout', () => {
    testing.useFakeTimers();

    testing.setSystemTime(now.toDate());

    render(<SessionTracker />);

    // Advance time to just past NOTIFICATION_TIMEOUT minutes before session timeout
    testing.advanceTimersByTime((10 - NOTIFICATION_TIMEOUT) * 60 * 1000 + 1500);

    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'session-expiration-warning',
        autoClose: false,
        title: 'You have been inactive, your session will expire in 3 minutes',
        message: '',
      }),
    );
  });
});
