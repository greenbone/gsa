/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import EverythingCapabilities from 'gmp/capabilities/everything';
import Response from 'gmp/http/response';
import Page from 'web/pages/Page';
import {
  setIsLoggedIn,
  setTimezone,
  setUsername,
} from 'web/store/usersettings/actions';

describe('Page tests', () => {
  test('renders null when capabilities are not loaded', () => {
    const gmp = {
      user: {
        currentCapabilities: testing
          .fn()
          .mockResolvedValue(
            new Response<undefined>({} as XMLHttpRequest, undefined),
          ),
      },
    };

    const {render} = rendererWith({gmp});
    const {container} = render(
      <Page>
        <div>Child Content</div>
      </Page>,
    );

    expect(screen.queryByText('Child Content')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  test('renders the page with all components when capabilities are loaded', async () => {
    const gmp = {
      user: {
        currentCapabilities: testing
          .fn()
          .mockResolvedValue(
            new Response({} as XMLHttpRequest, new EverythingCapabilities()),
          ),
      },
      feedstatus: {
        isEnterpriseFeed: testing.fn().mockResolvedValue(false),
        checkFeedSync: testing.fn().mockResolvedValue({
          isSyncing: true,
        }),
      },
      settings: {
        manualUrl: 'https://example.com/manual',
        enableCommunityFeedNotification: true,
      },
    };
    const {render, store} = rendererWith({gmp});

    store.dispatch(setUsername('testuser'));
    store.dispatch(setIsLoggedIn(true));
    store.dispatch(setTimezone('UTC'));

    render(
      <Page>
        <div>Child Content</div>
      </Page>,
    );

    await wait();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /dashboards/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /scans/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /assets/i})).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /resilience/i})).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /security information/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /configuration/i}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /administration/i}),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /help/i})).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(
      screen.getByText(/Please wait while the feed is syncing./i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /You are currently using the free Greenbone Community Feed/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    expect(screen.getByText(/Copyright © 2009-/i)).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
