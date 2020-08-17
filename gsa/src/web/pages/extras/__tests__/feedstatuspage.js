/* Copyright (C) 2020 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {rendererWith, wait} from 'web/utils/testing';

import FeedStatus, {composeObjFilter} from '../feedstatuspage';
import {Feed} from 'gmp/commands/feedstatus';

import Response from 'gmp/http/response';

const mockDate = new Date(1595660400000); // Saturday July 25 090000

// store global.Date.now to restore later
const _now = global.Date.now;

// set mockDate so the feed ages don't keep changing
global.Date.now = jest.fn(() => mockDate);

const nvtFeed = new Feed({
  name: 'Greenbone Community Feed',
  type: 'NVT',
  version: 202007241005,
});

const scapFeed = new Feed({
  name: 'Greenbone Community SCAP Feed',
  type: 'SCAP',
  version: 202007230130,
});

const certFeed = new Feed({
  name: 'Greenbone Community CERT Feed',
  type: 'CERT',
  version: 202005231003,
});

const gvmdDataFeed = new Feed({
  name: 'Greenbone Community gvmd Data Feed',
  type: 'GVMD_DATA',
  version: 202006221009,
  currently_syncing: {timestamp: 'foo'},
});

const data = [nvtFeed, scapFeed, certFeed, gvmdDataFeed];

const xhr = {
  response: 'foo',
  responseText: 'bar',
  responseXML: 'ipsum',
};

const response = new Response(xhr, data);

const gmp = {
  feedstatus: {
    readFeedInformation: jest.fn(() => Promise.resolve(response)),
  },
  settings: {
    manualUrl: 'http://foo.bar',
  },
};

describe('Feed status page tests', () => {
  test('should render', async () => {
    const {render} = rendererWith({gmp, router: true});
    const {element, getAllByTestId} = render(<FeedStatus />);

    await wait();

    // Should render all icons
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toEqual(12);

    expect(icons[0]).toHaveTextContent('help.svg');
    expect(icons[0]).toHaveAttribute('title', 'Help: Feed Status');

    expect(icons[1]).toHaveTextContent('feed.svg');
    expect(icons[2]).toHaveTextContent('nvt.svg');
    expect(icons[3]).toHaveTextContent('cve.svg');
    expect(icons[4]).toHaveTextContent('cpe.svg');
    expect(icons[5]).toHaveTextContent('ovaldef.svg');
    expect(icons[6]).toHaveTextContent('cert_bund_adv.svg');
    expect(icons[7]).toHaveTextContent('dfn_cert_adv.svg');
    expect(icons[8]).toHaveTextContent('policy.svg');
    expect(icons[9]).toHaveTextContent('port_list.svg');
    expect(icons[10]).toHaveTextContent('report_format.svg');
    expect(icons[11]).toHaveTextContent('config.svg');

    // Should render all links
    const links = element.querySelectorAll('a');

    expect(links.length).toEqual(11);

    expect(links[0]).toHaveAttribute(
      'href',
      'http://foo.bar/en/web-interface.html#displaying-the-feed-status',
    );
    expect(links[1]).toHaveAttribute('href', '/nvts');
    expect(links[2]).toHaveAttribute('href', '/cves');
    expect(links[3]).toHaveAttribute('href', '/cpes');
    expect(links[4]).toHaveAttribute('href', '/ovaldefs');
    expect(links[5]).toHaveAttribute('href', '/certbunds');
    expect(links[6]).toHaveAttribute('href', '/dfncerts');
    expect(links[7]).toHaveAttribute(
      'href',
      '/policies?filter=uuid%3Dc4b7c0cb-6502-4809-b034-8e635311b3e6%20',
    );
    expect(links[8]).toHaveAttribute(
      'href',
      '/portlists?filter=uuid%3D33d0cd82-57c6-11e1-8ed1-406186ea4fc5%20uuid%3D4a4717fe-57d2-11e1-9a26-406186ea4fc5%20uuid%3D730ef368-57e2-11e1-a90f-406186ea4fc5%20',
    );
    expect(links[9]).toHaveAttribute(
      'href',
      '/reportformats?filter=uuid%3D5057e5cc-b825-11e4-9d0e-28d24461215b%20uuid%3Dc1645568-627a-11e3-a660-406186ea4fc5%20uuid%3D77bd6c4a-1f62-11e1-abf0-406186ea4fc5%20uuid%3Dc402cc3e-b531-11e1-9163-406186ea4fc5%20uuid%3Da3810a62-1f62-11e1-9219-406186ea4fc5%20uuid%3Da994b278-1f62-11e1-96ac-406186ea4fc5%20',
    );
    expect(links[10]).toHaveAttribute(
      'href',
      '/scanconfigs?filter=uuid%3Dd21f6c81-2b88-4ac1-b7b4-a2a9f2ad4663%20uuid%3D8715c877-47a0-438d-98a3-27c7a6ab2196%20uuid%3D085569ce-73ed-11df-83c3-002264764cea%20uuid%3Ddaba56c8-73ec-11df-a475-002264764cea%20uuid%3D2d3f051c-55ba-11e3-bf43-406186ea4fc5%20uuid%3Dbbca7412-a950-11e3-9109-406186ea4fc5%20',
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
    const updateMsgs = getAllByTestId('update-msg');

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

describe('Test uuid filter composer', () => {
  test('Should return empty string for empty array', () => {
    const emptyFilter = composeObjFilter([]);
    expect(emptyFilter).toEqual('');
  });

  test('Should not crash on undefined input', () => {
    const noFilter = composeObjFilter();
    expect(noFilter).toEqual('');
  });

  test('Should return correct filter string', () => {
    const filterString = composeObjFilter(['foo', 'bar', 'baz']);
    expect(filterString).toEqual('uuid=foo uuid=bar uuid=baz ');
  });
});

// restore overwritten method
global.Date.now = _now;
