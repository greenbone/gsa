/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, waitFor, screen} from 'web/testing';
import FeedSyncNotification from 'web/components/notification/FeedSyncNotification/FeedSyncNotification';
import {setSyncStatus, setError} from 'web/store/feedStatus/actions';

const gmp = {settings: {manualUrl: 'http://localhost/manual'}};

describe('FeedSyncNotification', () => {
  test('should display syncing message when feed is syncing', async () => {
    const {render, store} = rendererWith({store: true, gmp});

    render(<FeedSyncNotification />);

    store.dispatch(setSyncStatus(true));

    await waitFor(() => {
      expect(screen.getByText('Feed is currently syncing.')).toBeVisible();
    });
    expect(
      screen.getByText(
        /Please wait while the feed is syncing. Scans are not available during this time. For more information, visit the/,
      ),
    ).toBeVisible();
    expect(screen.getByText(/Documentation/)).toBeVisible();
  });

  test('should display error message when there is an error', () => {
    const {render, store} = rendererWith({store: true, gmp});

    render(<FeedSyncNotification />);

    store.dispatch(setError('Error fetching the feed'));

    expect(screen.getByText('Error fetching the feed')).toBeVisible();
    expect(
      screen.getByText(
        'There was an error fetching the feed. It will be retried in a few minutes.',
      ),
    ).toBeVisible();
    expect(
      screen.getByText(
        'There was an error fetching the feed. It will be retried in a few minutes.',
      ),
    ).toBeVisible();
  });

  test('should not render anything when isFeedSyncDialogOpened is false', async () => {
    const {render} = rendererWith({store: true, gmp});

    render(<FeedSyncNotification />);
    expect(screen.queryByText('Feed is currently syncing.')).toBeNull();

    const closeButton = screen.getByTestId('panel-close-button');
    closeButton.click();

    await waitFor(() => {
      expect(screen.queryByText('Feed is currently syncing.')).toBeNull();
    });
    expect(screen.queryByText('Error fetching the feed')).toBeNull();
  });
});
