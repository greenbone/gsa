/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {createFeed} from 'gmp/commands/feed-status';
import Response from 'gmp/http/response';
import FeedStatus from 'web/pages/feed-configuration/FeedConfigurationPage';

testing.setSystemTime(new Date('2020-07-25T07:00:00Z'));

const nvtFeed = createFeed({
  name: 'Greenbone Community Feed',
  type: 'NVT',
  description: 'Community Feed',
  version: 202007241005,
});

const scapFeed = createFeed({
  name: 'Greenbone Community SCAP Feed',
  type: 'SCAP',
  description: 'Community SCAP Feed',
  version: 202007230130,
});

const certFeed = createFeed({
  name: 'Greenbone Community CERT Feed',
  type: 'CERT',
  description: 'Community CERT Feed',
  version: 202005231003,
});

const gvmdDataFeed = createFeed({
  name: 'Greenbone Community gvmd Data Feed',
  type: 'GVMD_DATA',
  description: 'Community gvmd Data Feed',
  version: 202006221009,
  currently_syncing: {timestamp: 'foo'},
});

describe('Feed status page tests', () => {
  test('should render', async () => {
    const response = new Response([nvtFeed, scapFeed, certFeed, gvmdDataFeed]);
    const gmp = {
      feedstatus: {
        readFeedInformation: testing.fn(() => Promise.resolve(response)),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render} = rendererWith({gmp, router: true});
    render(<FeedStatus />);

    await screen.findByRole('table');

    const helpIcon = screen.getByTestId('help-icon');
    expect(helpIcon).toHaveAttribute('title', 'Help: Feed Configuration');

    // Batch link queries and check specific ones
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(10);

    expect(links[0]).toHaveAttribute(
      'href',
      'http://foo.bar/en/web-interface.html#displaying-the-feed-configuration',
    );
    expect(links[1]).toHaveAttribute('href', '/nvts');
    expect(links[2]).toHaveAttribute('href', '/cves');
    expect(links[3]).toHaveAttribute('href', '/cpes');
    expect(links[4]).toHaveAttribute('href', '/certbunds');
    expect(links[5]).toHaveAttribute('href', '/dfncerts');
    expect(links[6]).toHaveAttribute('href', '/policies?filter=predefined%3D1');
    expect(links[7]).toHaveAttribute(
      'href',
      '/portlists?filter=predefined%3D1',
    );
    expect(links[8]).toHaveAttribute(
      'href',
      '/reportformats?filter=predefined%3D1',
    );
    expect(links[9]).toHaveAttribute(
      'href',
      '/scanconfigs?filter=predefined%3D1',
    );

    // Batch header queries
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveTextContent('Type');
    expect(headers[1]).toHaveTextContent('Content');
    expect(headers[2]).toHaveTextContent('Origin');
    expect(headers[3]).toHaveTextContent('Version');
    expect(headers[4]).toHaveTextContent('Status');

    // Check critical text content
    screen.getByText('NVT');
    screen.getByText('SCAP');
    screen.getByText('CERT');
    screen.getByText('GVMD_DATA');

    screen.getByText('Greenbone Community Feed');
    screen.getByText('Greenbone Community SCAP Feed');
    screen.getByText('Greenbone Community CERT Feed');
    screen.getByText('Greenbone Community gvmd Data Feed');

    screen.getByText('20200724T1005');
    screen.getByText('20200723T0130');
    screen.getByText('20200523T1003');
    screen.getByText('20200622T1009');

    // Batch update messages and age indicators
    const updateMsgs = screen.getAllByTestId('update-msg');
    expect(updateMsgs).toHaveLength(4);

    // Check status messages
    screen.getByText('Current');
    screen.getByText('2 days old');
    screen.getByText('Too old (62 days)');
    expect(updateMsgs[2]).toHaveTextContent(
      'Please check the automatic synchronization of your system.',
    );
    screen.getByText('Update in progress...');
  });
});

testing.useRealTimers();
