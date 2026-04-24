/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';

/**
 * Hook that automatically tracks user activity to renew the session timeout.
 * It listens for user interactions like clicks on buttons or links
 * and dispatches an action to renew the session timeout.
 * It also implements a cooldown period to prevent excessive renewals.
 * The cooldown lasts for 10 seconds after a user activity.
 * If the user interacts with the page during this cooldown, the session renewal is ignored.
 */

const useSessionTracker = () => {
  const [, renewSession] = useUserSessionTimeout();

  useEffect(() => {
    void renewSession();

    let isCooldown = false;
    let cooldownTimeoutId: ReturnType<typeof setTimeout>;

    const handleUserActivity = async () => {
      if (isCooldown) return;
      await renewSession();
      isCooldown = true;
      cooldownTimeoutId = setTimeout(() => {
        isCooldown = false;
      }, 10000);
    };

    const handleClick = async (event: MouseEvent | KeyboardEvent) => {
      if (isCooldown) return;
      if (!(event instanceof MouseEvent)) return;
      const path = event.composedPath?.() || [];
      const found = path.find(
        (el: EventTarget) =>
          el instanceof HTMLElement &&
          (el.tagName === 'BUTTON' || el.tagName === 'A'),
      );
      if (found) {
        await handleUserActivity();
      }
    };

    const events = ['keypress', 'wheel', 'drag'];

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });
    window.addEventListener('click', handleClick);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      window.removeEventListener('click', handleClick);
      clearTimeout(cooldownTimeoutId);
      isCooldown = false;
    };
  }, [renewSession]);

  return renewSession;
};

export default useSessionTracker;
