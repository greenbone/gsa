/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {describe, test, expect, testing, beforeEach} from '@gsa/testing';
import {vi} from 'vitest';
import CommunityFeedUsageNotification from 'web/pages/login/notifications/CommunityFeedUsageNotification';

vi.mock('@greenbone/opensight-ui-components-mantinev7', () => ({
  showNotification: vi.fn(),
}));

describe('CommunityFeedUsageNotification', () => {
  beforeEach(() => {
    testing.clearAllMocks();
    sessionStorage.clear();
  });

  test('Notification should be shown on login if not already shown', () => {
    sessionStorage.setItem('communityFeedNotificationShown', 'false');

    CommunityFeedUsageNotification();

    expect(showNotification).toHaveBeenCalledTimes(1);
    expect(showNotification).toHaveBeenCalledWith({
      autoClose: false,
      title: expect.anything(),
      message: '',
    });

    expect(sessionStorage.getItem('communityFeedNotificationShown')).toBe(
      'true',
    );
  });

  test('Notification should not be shown if already shown', () => {
    sessionStorage.setItem('communityFeedNotificationShown', 'true');

    CommunityFeedUsageNotification();

    expect(showNotification).not.toHaveBeenCalled();
  });
});
