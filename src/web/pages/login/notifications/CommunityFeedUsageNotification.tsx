/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import {updateNotification} from '@mantine/notifications';
import React, {useEffect, useMemo} from 'react';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

export const NOTIFICATION_SHOWN_KEY = 'communityFeedNotificationShown';
export const NOTIFICATION_SHOWN = 'true';
const NEVER_AUTO_CLOSE = false;

const CommunityFeedUsageNotification: React.FC = () => {
  const NOTIFICATION_ID = 'communityFeedNotification';
  const [_] = useTranslation();
  const [language] = useLanguage();

  const notificationMessage = useMemo(
    () => (
      <div aria-label="community-feed-notification">
        <p>
          {_(
            'You are currently using the free Greenbone Community Feed - this shows only a few vulnerabilities for business critical enterprise software such as MS Exchange, Cisco, VMware, Citrix and many more. Over 60% of all relevant exploits remain hidden.',
          )}
        </p>
        <p>
          <a
            aria-label="Learn more about feed comparison"
            href={_('https://www.greenbone.net/en/feed-comparison/')}
            rel="noopener noreferrer"
            target="_blank"
          >
            {_('Learn more')}
          </a>
        </p>
      </div>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [_, language],
  );

  useEffect(() => {
    const hasBeenShown =
      sessionStorage.getItem(NOTIFICATION_SHOWN_KEY) === NOTIFICATION_SHOWN;

    if (!hasBeenShown) {
      showNotification({
        id: NOTIFICATION_ID,
        autoClose: NEVER_AUTO_CLOSE,
        title: notificationMessage,
        message: '',
      });
      sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);
    } else if (hasBeenShown) {
      updateNotification({
        id: NOTIFICATION_ID,
        autoClose: NEVER_AUTO_CLOSE,
        title: notificationMessage,
        message: '',
      });
    }
  }, [notificationMessage, language, NOTIFICATION_ID]);
  return null;
};

export default CommunityFeedUsageNotification;
