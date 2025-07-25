/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect} from 'react';
import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import date from 'gmp/models/date';
import useSessionTracker from 'web/hooks/useSessionTracker';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';

const SessionTracker = () => {
  const [_] = useTranslation();
  const [sessionTimeout] = useUserSessionTimeout();
  useSessionTracker();

  useEffect(() => {
    if (!sessionTimeout) return;
    const checkTimeLeft = () => {
      const now = date();
      const duration = date.duration(sessionTimeout.diff(now));
      if (Math.floor(duration.asMinutes()) === 3 && duration.seconds() === 0) {
        showNotification({
          id: 'session-expiration-warning',
          autoClose: false,
          title: _(
            'You have been inactive, your session will expire in 3 minutes',
          ),
          message: '',
        });
      }
    };
    const intervalId = setInterval(checkTimeLeft, 1000);
    return () => clearInterval(intervalId);
  }, [_, sessionTimeout]);

  return undefined;
};

export default SessionTracker;
