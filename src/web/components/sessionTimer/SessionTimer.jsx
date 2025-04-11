/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ActionIcon} from '@mantine/core';
import date from 'gmp/models/date';
import {useEffect, useState} from 'react';
import { RefreshIcon } from 'web/components/icon/icons';
import Divider from 'web/components/layout/Divider';
import useTranslation from 'web/hooks/useTranslation';
import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import Theme from 'web/utils/Theme';
const SessionTimer = () => {
  const [sessionTimeout, renewSession] = useUserSessionTimeout();
  const [timeLeft, setTimeLeft] = useState('');
  const [_] = useTranslation();

  useEffect(() => {
    const updateTimeLeft = () => {
      if (!sessionTimeout) {
        return <div>Session timer is currently unavailable.</div>;
      }
      const now = date();
      const duration = date.duration(sessionTimeout.diff(now));
      if (duration.asSeconds() <= 0) {
        setTimeLeft('00:00');
      } else {
        const formatted =
          Math.floor(duration.asMinutes()) +
          ':' +
          ('0' + duration.seconds()).slice(-2);
        setTimeLeft(formatted);
      }
    };

    updateTimeLeft();
    const intervalId = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(intervalId);
  }, [sessionTimeout]);

  return (
    <Divider>
      <span>{timeLeft}</span>
      <ActionIcon
        color="neutral.0"
        title={_('Renew session timeout')}
        variant="transparent"
        onClick={renewSession}
      >
        <RefreshIcon color={Theme.white} />
      </ActionIcon>
    </Divider>
  );
};

export default SessionTimer;
