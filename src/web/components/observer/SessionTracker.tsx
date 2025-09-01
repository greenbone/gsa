/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {notifications} from '@mantine/notifications';
import {showNotification} from '@greenbone/ui-lib';

import date from 'gmp/models/date';
import useSessionTracker from 'web/hooks/useSessionTracker';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';

export const NOTIFICATION_TIMEOUT = 3;
const notificationId = 'session-expiration-warning';

const SessionTracker = () => {
  const [_] = useTranslation();
  const [sessionTimeout] = useUserSessionTimeout();
  useSessionTracker();

  useEffect(() => {
    if (!sessionTimeout) return;
    const checkTimeLeft = () => {
      const now = date();
      const notificationTime = sessionTimeout.subtract(
        NOTIFICATION_TIMEOUT,
        'minutes',
      );
      if (now.isAfter(notificationTime)) {
        showNotification({
          id: notificationId,
          autoClose: false,
          title: _(
            'You have been inactive, your session will expire in 3 minutes',
          ),
          message: '',
        });
      } else {
        // Hide the notification if timer is more than notification timeout
        notifications.hide(notificationId);
      }
    };
    const intervalId = setInterval(checkTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, [_, sessionTimeout]);

  return undefined;
};

export default SessionTracker;
