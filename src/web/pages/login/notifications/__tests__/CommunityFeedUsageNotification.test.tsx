/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeEach, testing} from '@gsa/testing';
import {updateNotification} from '@mantine/notifications';
import {screen, rendererWith, wait} from 'web/testing';
import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {vi} from 'vitest';
import CommunityFeedUsageNotification, {
  NOTIFICATION_SHOWN_KEY,
  NOTIFICATION_SHOWN,
} from 'web/pages/login/notifications/CommunityFeedUsageNotification';

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

  test('shows notification if it has not been shown before', async () => {
    const isEnterpriseFeed = testing.fn().mockResolvedValue(false);
    const gmp = {
      feedstatus: {
        isEnterpriseFeed,
      },
    };
    const notificationTitle =
      'You are currently using the free Greenbone Community Feed - this shows only a few vulnerabilities for business critical enterprise software such as MS Exchange, Cisco, VMware, Citrix and many more. Over 60% of all relevant exploits remain hidden.';

    const {render} = rendererWith({gmp});
    render(<CommunityFeedUsageNotification />);

    await wait();
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'communityFeedNotification',
        autoClose: false,
        title: expect.anything(),
        message: '',
      }),
    );
    expect(isEnterpriseFeed).toHaveBeenCalledTimes(1);

    const mockCalls = vi.mocked(showNotification, {partial: true}).mock.calls;
    const [notificationArgs] = mockCalls[0];
    const {title} = notificationArgs;
    render(title);
    expect(screen.getByText(notificationTitle)).toBeVisible();
    expect(sessionStorage.getItem(NOTIFICATION_SHOWN_KEY)).toBe(
      NOTIFICATION_SHOWN,
    );
  });

  test('updates notification if it has already been shown', async () => {
    const isEnterpriseFeed = testing.fn().mockResolvedValue(false);
    const gmp = {
      feedstatus: {
        isEnterpriseFeed,
      },
    };
    const {render} = rendererWith({gmp});
    sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);

    render(<CommunityFeedUsageNotification />);

    await wait();
    expect(updateNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'communityFeedNotification',
        autoClose: false,
        title: expect.anything(),
        message: '',
      }),
    );
    expect(isEnterpriseFeed).toHaveBeenCalledTimes(1);
  });

  test('does not show or update notification if already handled in the same session', async () => {
    const isEnterpriseFeed = testing.fn().mockResolvedValue(false);
    const gmp = {
      feedstatus: {
        isEnterpriseFeed,
      },
    };
    const {render} = rendererWith({gmp});
    sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);

    render(<CommunityFeedUsageNotification />);

    await wait();
    expect(showNotification).toHaveBeenCalledTimes(0);
    expect(isEnterpriseFeed).toHaveBeenCalledTimes(1);
  });

  test('should not show notification if the feed is enterprise', async () => {
    const isEnterpriseFeed = testing.fn().mockResolvedValue(true);
    const gmp = {
      feedstatus: {
        isEnterpriseFeed,
      },
    };
    const {render} = rendererWith({gmp});

    render(<CommunityFeedUsageNotification />);

    await wait();
    expect(showNotification).toHaveBeenCalledTimes(0);
    expect(updateNotification).toHaveBeenCalledTimes(0);
    expect(isEnterpriseFeed).toHaveBeenCalledTimes(1);
  });
});
