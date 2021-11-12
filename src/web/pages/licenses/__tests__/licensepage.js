/* Copyright (C) 2021 Greenbone Networks GmbH
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

import {setLocale} from 'gmp/locale/lang';

import {License} from 'gmp/commands/license';

import Response from 'gmp/http/response';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, waitFor} from 'web/utils/testing';
import LicensePage from '../licensepage';

setLocale('en');

const data = new License({
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-27T06:05:21Z',
      begins: '2021-08-27T07:05:21Z',
      expires: '2021-09-04T07:05:21Z',
      comment: 'Han shot first',
    },
    appliance: {
      model: 'trial',
      model_type: '450',
      sensor: false,
    },
    keys: {
      key: {
        _name: 'feed',
        __text: '*base64 GSF key*',
      },
    },
    signatures: {
      license: '*base64 signature*',
    },
  },
});

const xhr = {
  response: 'foo',
  responseText: 'bar',
  responseXML: 'ipsum',
};

const response = new Response(xhr, data);
const gmp = {
  license: {
    getLicenseInformation: jest.fn(() => Promise.resolve(response)),
  },
  settings: {
    manualUrl: 'http://foo.bar',
  },
};

describe('LicensePage tests', () => {
  test('should render', async () => {
    const {render, store} = rendererWith({gmp, router: true, store: true});
    const {element, getAllByRole, getAllByTestId} = render(<LicensePage />);

    store.dispatch(setTimezone('UTC'));

    await waitFor(() => element.querySelectorAll('table'));

    // Should render all icons
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toEqual(2);

    expect(icons[0]).toHaveTextContent('help.svg');
    expect(icons[0]).toHaveAttribute('title', 'Help: License Management');
    expect(icons[1]).toHaveTextContent('license.svg');

    // Should render links
    const links = element.querySelectorAll('a');

    expect(links.length).toEqual(1);

    expect(links[0]).toHaveAttribute(
      'href',
      'http://foo.bar/en/web-interface.html#license-management',
    );

    // License Information
    expect(element).toHaveTextContent('ID');
    expect(element).toHaveTextContent('12345');
    expect(element).toHaveTextContent('Customer Name');
    expect(element).toHaveTextContent('Monsters Inc.');
    expect(element).toHaveTextContent('Creation Date');
    expect(element).toHaveTextContent('Fri, Aug 27, 2021 7:05 AM UTC');
    expect(element).toHaveTextContent('Version');
    expect(element).toHaveTextContent('1.0.0');
    expect(element).toHaveTextContent('Begins');
    expect(element).toHaveTextContent('Fri, Aug 27, 2021 7:05 AM UTC');
    expect(element).toHaveTextContent('Expires');
    expect(element).toHaveTextContent('Sat, Sep 4, 2021 7:05 AM UTC');
    expect(element).toHaveTextContent('Comment');
    expect(element).toHaveTextContent('Han shot first');
    expect(element).toHaveTextContent('Model');
    expect(element).toHaveTextContent('trial');
    expect(element).toHaveTextContent('Model Type');
    expect(element).toHaveTextContent('450');

    // Headings
    const headings = getAllByRole('heading');
    expect(headings[0]).toHaveTextContent('License Management');
    expect(headings[1]).toHaveTextContent('Information');
    expect(headings[2]).toHaveTextContent('Model');
  });
});
