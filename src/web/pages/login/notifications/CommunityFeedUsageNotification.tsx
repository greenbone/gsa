/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React, {useEffect, useMemo} from 'react';
import {updateNotification} from '@mantine/notifications';
import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import useLanguage from 'web/hooks/useLanguage';
import useTranslation from 'web/hooks/useTranslation';

export const COMMUNITY_FEED_USAGE_NOTIFICATION_ID = 'communityFeedNotification';
export const NOTIFICATION_SHOWN_KEY = 'communityFeedNotificationShown';
export const NOTIFICATION_SHOWN = 'true';
const NEVER_AUTO_CLOSE = false;

const CommunityFeedUsageNotification: React.FC = () => {
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
        id: COMMUNITY_FEED_USAGE_NOTIFICATION_ID,
        autoClose: NEVER_AUTO_CLOSE,
        title: notificationMessage,
        message: '',
      });
      sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);
    } else if (hasBeenShown) {
      updateNotification({
        id: COMMUNITY_FEED_USAGE_NOTIFICATION_ID,
        autoClose: NEVER_AUTO_CLOSE,
        title: notificationMessage,
        message: '',
      });
    }
  }, [notificationMessage, language]);
  return null;
};

export default CommunityFeedUsageNotification;
