/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {Transition} from '@mantine/core';
import {notifications, notificationsStore} from '@mantine/notifications';
import {afterEach, describe, expect, test, testing} from '@gsa/testing';
import {act, cleanupRender, render, screen} from 'web/testing';

afterEach(() => {
  testing.useRealTimers();
  testing.restoreAllMocks();
});

describe('shared renderer teardown', () => {
  test.each([false, true])(
    'should finish explicit transitions synchronously with fake timers enabled %s',
    async fakeTimers => {
      if (fakeTimers) {
        testing.useFakeTimers();
      }
      const onEntered = testing.fn();
      const onExited = testing.fn();
      const transition = (mounted: boolean) => (
        <Transition
          duration={1000}
          exitDuration={1000}
          mounted={mounted}
          onEntered={onEntered}
          onExited={onExited}
        >
          {style => <div style={style}>Transition content</div>}
        </Transition>
      );
      const {rerender} = render(transition(false));
      const requestFrame = testing.spyOn(window, 'requestAnimationFrame');

      rerender(transition(true));

      expect(screen.getByText('Transition content')).toBeVisible();
      expect(onEntered).toHaveBeenCalledOnce();

      rerender(transition(false));

      expect(screen.queryByText('Transition content')).not.toBeInTheDocument();
      expect(onExited).toHaveBeenCalledOnce();
      expect(requestFrame).not.toHaveBeenCalled();

      await cleanupRender();

      if (fakeTimers) {
        expect(testing.getTimerCount()).toBe(0);
      }
    },
  );

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
