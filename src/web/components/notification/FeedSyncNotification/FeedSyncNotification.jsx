/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import BlankLink from 'web/components/link/blanklink';
import {
  useFeedSyncStatus,
  useFeedSyncDialog,
} from 'web/components/notification/FeedSyncNotification/helpers';
import InfoPanel from 'web/components/panel/infopanel';
import useTranslation from 'web/hooks/useTranslation';

const NotificationWrapper = styled.div`
  padding-bottom: 20px;
`;

const FeedSyncNotification = () => {
  const [_] = useTranslation();
  useFeedSyncStatus();

  const [isFeedSyncDialogOpened, setIsFeedSyncDialogOpened, feedStatus] =
    useFeedSyncDialog();

  const handleCloseFeedSyncNotification = () => {
    setIsFeedSyncDialogOpened(false);
  };

  if (!isFeedSyncDialogOpened) return null;

  return (
    <NotificationWrapper>
      <InfoPanel
        heading={
          feedStatus.error
            ? _('Error fetching the feed')
            : _('Feed is currently syncing.')
        }
        isWarning={Boolean(feedStatus.error)}
        onCloseClick={handleCloseFeedSyncNotification}
      >
        {feedStatus.error ? (
          <p>
            {_(
              `There was an error fetching the feed. It will be retried in a few minutes.`,
            )}
          </p>
        ) : (
          <p>
            {_(
              `Please wait while the feed is syncing. Scans are not available during this time. For more information, visit the`,
            )}{' '}
            <BlankLink
              to={
                'https://docs.greenbone.net/GSM-Manual/gos-21.04/en/scanning.html?highlight=scan'
              }
            >
              {_('Documentation')}.
            </BlankLink>
          </p>
        )}
      </InfoPanel>
    </NotificationWrapper>
  );
};

export default FeedSyncNotification;
