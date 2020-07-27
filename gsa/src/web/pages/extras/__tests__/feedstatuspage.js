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

import {rendererWith, wait, waitForElement} from 'web/utils/testing';

import FeedStatus from '../feedstatuspage';
import {Feed} from 'gmp/commands/feedstatus';

import Response from 'gmp/http/response';

const mockDate = new Date(1595833720475);

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
  version: 202007231003,
});

const gvmdDataFeed = new Feed({
  name: 'Greenbone Community GVMd Data Feed',
  type: 'GVMD_DATA',
  version: 202007221009,
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

    expect(element).toMatchSnapshot();

    // Should render all icons
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toBe(12);
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
  });
});
