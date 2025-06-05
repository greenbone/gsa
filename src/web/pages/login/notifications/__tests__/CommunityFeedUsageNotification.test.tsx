/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {describe, test, expect, beforeEach, testing} from '@gsa/testing';
import {updateNotification} from '@mantine/notifications';
import {vi} from 'vitest';
import CommunityFeedUsageNotification, {
  NOTIFICATION_SHOWN_KEY,
  NOTIFICATION_SHOWN,
} from 'web/pages/login/notifications/CommunityFeedUsageNotification';
import {screen, render} from 'web/testing';

vi.mock('@greenbone/opensight-ui-components-mantinev7', () => ({
  showNotification: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ThemeProvider: ({children}) => children,
  theme: {
    colorScheme: 'light',
  },
}));

vi.mock('@mantine/notifications', () => ({
  updateNotification: vi.fn(),
}));

describe('CommunityFeedUsageNotification', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    sessionStorage.clear();
  });

  test('shows notification if it has not been shown before', () => {
    render(<CommunityFeedUsageNotification />);

    const notificationTitle =
      'You are currently using the free Greenbone Community Feed - this shows only a few vulnerabilities for business critical enterprise software such as MS Exchange, Cisco, VMware, Citrix and many more. Over 60% of all relevant exploits remain hidden.';

    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'communityFeedNotification',
        autoClose: false,
        title: expect.anything(),
        message: '',
      }),
    );

    const mockCalls = vi.mocked(showNotification, {partial: true}).mock.calls;
    const [notificationArgs] = mockCalls[0];
    const {title} = notificationArgs;
    render(title);
    expect(screen.getByText(notificationTitle)).toBeVisible();
    expect(sessionStorage.getItem(NOTIFICATION_SHOWN_KEY)).toBe(
      NOTIFICATION_SHOWN,
    );
  });

  test('updates notification if it has already been shown', () => {
    sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);

    render(<CommunityFeedUsageNotification />);

    expect(updateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'communityFeedNotification',
        autoClose: false,
        title: expect.anything(),
        message: '',
      }),
    );
  });

  test('does not show or update notification if already handled in the same session', () => {
    sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);

    render(<CommunityFeedUsageNotification />);

    expect(showNotification).toHaveBeenCalledTimes(0);
  });
});
