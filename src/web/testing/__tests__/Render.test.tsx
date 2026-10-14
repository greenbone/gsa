/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {notifications, notificationsStore} from '@mantine/notifications';
import {afterEach, describe, expect, test, testing} from '@gsa/testing';
import {act, cleanupRender, render, screen} from 'web/testing';

afterEach(() => {
  testing.useRealTimers();
  testing.restoreAllMocks();
});

describe('shared renderer teardown', () => {
  test.each([false, true])(
    'should clean pending notifications with fake timers enabled %s',
    async fakeTimers => {
      if (fakeTimers) {
        testing.useFakeTimers();
      }
      render(<div />);

      act(() => {
        for (let index = 0; index < 6; index++) {
          notifications.show({
            id: `teardown-test-${index}`,
            message: `Pending notification ${index}`,
          });
        }
      });

      expect(screen.getByText('Pending notification 0')).toBeVisible();
      expect(notificationsStore.getState().queue).toHaveLength(1);

      await cleanupRender();

      expect(notificationsStore.getState().notifications).toEqual([]);
      expect(notificationsStore.getState().queue).toEqual([]);
      if (fakeTimers) {
        expect(testing.getTimerCount()).toBe(0);
      }
      expect(
        screen.queryByText('Pending notification 0'),
      ).not.toBeInTheDocument();
    },
  );
});
