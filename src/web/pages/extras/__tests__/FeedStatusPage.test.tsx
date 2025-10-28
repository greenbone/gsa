/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {createFeed} from 'gmp/commands/feedstatus';
import Response from 'gmp/http/response';
import FeedStatus from 'web/pages/extras/FeedStatusPage';

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
    const {element} = render(<FeedStatus />);

    await waitFor(() => element.querySelectorAll('table'));

    expect(screen.getByTestId('help-icon')).toHaveAttribute(
      'title',
      'Help: Feed Status',
    );

    // Should render all links
    const links = element.querySelectorAll('a');

    expect(links.length).toEqual(10);

    expect(links[0]).toHaveAttribute(
      'href',
      'http://foo.bar/en/web-interface.html#displaying-the-feed-status',
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

    // Test headers
    const header = element.querySelectorAll('th');

    expect(header.length).toEqual(5);

    expect(header[0]).toHaveTextContent('Type');
    expect(header[1]).toHaveTextContent('Content');
    expect(header[2]).toHaveTextContent('Origin');
    expect(header[3]).toHaveTextContent('Version');
    expect(header[4]).toHaveTextContent('Status');

    // Type names
    expect(element).toHaveTextContent('NVT');
    expect(element).toHaveTextContent('SCAP');
    expect(element).toHaveTextContent('CERT');
    expect(element).toHaveTextContent('GVMD_DATA');

    // Feed Origin
    expect(element).toHaveTextContent('Greenbone Community Feed');
    expect(element).toHaveTextContent('Greenbone Community SCAP Feed');
    expect(element).toHaveTextContent('Greenbone Community CERT Feed');
    expect(element).toHaveTextContent('Greenbone Community gvmd Data Feed');

    // Feed versions
    expect(element).toHaveTextContent('20200724T1005');
    expect(element).toHaveTextContent('20200723T0130');
    expect(element).toHaveTextContent('20200523T1003');
    expect(element).toHaveTextContent('20200622T1009');

    // Feed Status

    const ageText = element.querySelectorAll('strong');
    const updateMsgs = screen.getAllByTestId('update-msg');

    expect(ageText.length).toEqual(4);
    expect(updateMsgs.length).toEqual(4);

    // Not too old and not currently syncing
    expect(ageText[0]).toHaveTextContent('Current');
    expect(updateMsgs[0]).toHaveTextContent('');

    expect(ageText[1]).toHaveTextContent('2 days old');
    expect(updateMsgs[1]).toHaveTextContent('');

    // CERT feed is too old but is not currently syncing
    expect(ageText[2]).toHaveTextContent('Too old (62 days)');
    expect(updateMsgs[2]).toHaveTextContent(
      'Please check the automatic synchronization of your system.',
    );

    // GVMD_DATA feed is too old but IS currently syncing
    expect(ageText[3]).toHaveTextContent('Update in progress...');
    expect(updateMsgs[3]).toHaveTextContent('');
  });
});

testing.useRealTimers();
