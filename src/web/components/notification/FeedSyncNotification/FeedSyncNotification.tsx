/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import {isDefined} from 'gmp/utils/identity';
import ManualLink from 'web/components/link/ManualLink';
import {
  useFeedSyncStatus,
  useFeedSyncDialog,
} from 'web/components/notification/FeedSyncNotification/hooks';
import InfoPanel from 'web/components/panel/InfoPanel';
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
      {/* @ts-expect-error */}
      <InfoPanel
        heading={
          isDefined(feedStatus.error)
            ? _('Error fetching the feed')
            : _('Feed is currently syncing.')
        }
        isWarning={isDefined(feedStatus.error)}
        onCloseClick={handleCloseFeedSyncNotification}
      >
        {isDefined(feedStatus.error) ? (
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
            <ManualLink
              highlight="scan"
              page="scanning"
              title={_('Documentation')}
            >
              {_('Documentation')}
            </ManualLink>
            .
          </p>
        )}
      </InfoPanel>
    </NotificationWrapper>
  );
};

export default FeedSyncNotification;
