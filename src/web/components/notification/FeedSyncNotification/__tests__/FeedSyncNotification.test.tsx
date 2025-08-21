/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import FeedSyncNotification from 'web/components/notification/FeedSyncNotification/FeedSyncNotification';
import {setSyncStatus, setError} from 'web/store/feedStatus/actions';

const gmp = {
  settings: {manualUrl: 'http://localhost/manual'},
  feedstatus: {
    checkFeedSync: () => Promise.resolve({isSyncing: false, error: null}),
  },
};

describe('FeedSyncNotification tests', () => {
  test('should display syncing message when feed is syncing', async () => {
    const {render, store} = rendererWith({store: true, gmp});

    render(<FeedSyncNotification />);

    await wait();

    store.dispatch(setSyncStatus(true));

    await wait();

    expect(
      screen.getByText(
        /Please wait while the feed is syncing. Scans are not available during this time. For more information, visit the/,
      ),
    ).toBeVisible();
    expect(screen.getByText(/Documentation/)).toBeVisible();
  });

  test('should display error message when there is an error', async () => {
    const {render, store} = rendererWith({store: true, gmp});

    render(<FeedSyncNotification />);

    await wait();

    store.dispatch(setError('Error fetching the feed'));

    await wait();

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

    const {container} = render(<FeedSyncNotification />);

    await wait();

    expect(container).toBeEmptyDOMElement();
  });
});
