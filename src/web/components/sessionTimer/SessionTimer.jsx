/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState} from 'react';

import useUserSessionTimeout from 'web/hooks/useUserSessionTimeout';
import date from 'gmp/models/date';
import RefreshIcon from 'web/components/icon/refreshicon';
import Divider from 'web/components/layout/divider';
import {ActionIcon} from '@mantine/core';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

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
        onClick={renewSession}
        variant="transparent"
        color="neutral.0"
        title={_('Renew session timeout')}
      >
        <RefreshIcon color={Theme.white} />
      </ActionIcon>
    </Divider>
  );
};

export default SessionTimer;
