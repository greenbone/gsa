/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {showNotification} from '@greenbone/opensight-ui-components-mantinev7';
import useTranslation from 'web/hooks/useTranslation';

const NOTIFICATION_SHOWN_KEY = 'communityFeedNotificationShown';
const NOTIFICATION_SHOWN = 'true';
const NEVER_AUTO_CLOSE = false;

const CommunityFeedUsageNotification = (): void => {
  const [_] = useTranslation();

  const isNotificationShown =
    sessionStorage.getItem(NOTIFICATION_SHOWN_KEY) === NOTIFICATION_SHOWN;

  if (isNotificationShown) {
    return;
  }

  const notificationMessage = (
    <div aria-label="community-feed-notification">
      <p>
        {_(
          'You are currently using the free OpenVAS Community Feed - this shows only a few vulnerabilities for business critical enterprise software such as MS Exchange, Cisco, VMware, Citrix and many more. Over 60% of all relevant exploits remain hidden.',
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
  );

  showNotification({
    autoClose: NEVER_AUTO_CLOSE,
    title: notificationMessage,
    message: '',
  });

  sessionStorage.setItem(NOTIFICATION_SHOWN_KEY, NOTIFICATION_SHOWN);
};

export default CommunityFeedUsageNotification;
