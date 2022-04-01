/* Copyright (C) 2021-2022 Greenbone Networks GmbH
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

import Capabilities from 'gmp/capabilities/capabilities';

import {setLocale} from 'gmp/locale/lang';

import {License} from 'gmp/models/license';

import Response from 'gmp/http/response';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, waitFor, wait} from 'web/utils/testing';

import LicensePage from '../licensepage';

setLocale('en');

const data = License.fromElement({
  status: 'active',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-27T06:05:21Z',
      begins: '2021-08-27T07:05:21Z',
      expires: '2021-09-08T07:05:21Z',
      comment: 'Han shot first',
    },
    appliance: {
      model: '450',
      model_type: 'hardware',
      sensor: false,
    },
  },
});

const data2 = License.fromElement({
  status: 'active',
  content: {
    meta: {
      id: '12345',
      version: '1.0.0',
      title: 'Test License',
      type: 'trial',
      customer_name: 'Monsters Inc.',
      created: '2021-08-27T06:05:21Z',
      begins: '2021-08-27T07:05:21Z',
      expires: '2021-09-09T07:05:21Z',
      comment: 'Han shot first',
    },
    appliance: {
      model: '450',
      model_type: 'hardware',
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

const caps = new Capabilities(['everything']);

const mockDate = new Date('2021-08-09T07:05:21Z');

beforeEach(() => {
  jest.spyOn(global.Date, 'now').mockImplementation(() => mockDate);
});

describe('LicensePage tests', () => {
  test('should render with <=30 days until expiration', async () => {
    const response = new Response(xhr, data);

    const gmp = {
      license: {
        getLicenseInformation: jest.fn(() => Promise.resolve(response)),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      license: data,
      gmp,
      router: true,
      store: true,
    });
    const {element, getAllByRole, getAllByTestId} = render(<LicensePage />);

    store.dispatch(setTimezone('UTC'));

    await waitFor(() => element.querySelectorAll('table'));

    // Should render all icons
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toEqual(4);

    expect(icons[0]).toHaveTextContent('help.svg');
    expect(icons[0]).toHaveAttribute('title', 'Help: License Management');
    expect(icons[1]).toHaveTextContent('new.svg');
    expect(icons[2]).toHaveTextContent('license.svg');
    expect(icons[3]).toHaveTextContent('help.svg');

    // Should render links
    const links = element.querySelectorAll('a');

    expect(links.length).toEqual(2);

    expect(links[0]).toHaveAttribute(
      'href',
      'http://foo.bar/en/web-interface.html#license-management',
    );

    expect(links[1]).toHaveAttribute('href', 'mailto:sales@greenbone.net');

    // License Information
    expect(element).toHaveTextContent('The license expires');
    expect(element).toHaveTextContent('in 30 days');
    expect(element).toHaveTextContent('Status');
    expect(element).toHaveTextContent('License is active');
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
    expect(element).toHaveTextContent('Expires on');
    expect(element).toHaveTextContent('Wed, Sep 8, 2021 7:05 AM UTC');
    expect(element).toHaveTextContent('Comment');
    expect(element).toHaveTextContent('Han shot first');
    expect(element).toHaveTextContent('Model');
    expect(element).toHaveTextContent('Greenbone Enterprise 450');
    expect(element).toHaveTextContent('Model Type');
    expect(element).toHaveTextContent('Hardware Appliance');

    // Headings
    const headings = getAllByRole('heading');
    expect(headings[0]).toHaveTextContent('License Management');
    expect(headings[1]).toHaveTextContent('Information');
    expect(headings[2]).toHaveTextContent('Model');
    expect(headings[3]).toHaveTextContent(
      'How to get a Greenbone Enterprise License',
    );
  });

  test('should render with >30 days until expiration', async () => {
    const response = new Response(xhr, data2);
    const gmp = {
      license: {
        getLicenseInformation: jest.fn(() => Promise.resolve(response)),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };
    const {render, store} = rendererWith({
      capabilities: caps,
      license: data2,
      gmp,
      router: true,
      store: true,
    });
    const {element, getAllByRole, getAllByTestId} = render(<LicensePage />);

    store.dispatch(setTimezone('UTC'));

    await waitFor(() => element.querySelectorAll('table'));

    // Should render all icons
    const icons = getAllByTestId('svg-icon');

    expect(icons.length).toEqual(4);

    expect(icons[0]).toHaveTextContent('help.svg');
    expect(icons[0]).toHaveAttribute('title', 'Help: License Management');
    expect(icons[1]).toHaveTextContent('new.svg');
    expect(icons[2]).toHaveTextContent('license.svg');
    expect(icons[3]).toHaveTextContent('help.svg');

    // Should render links
    const links = element.querySelectorAll('a');

    expect(links.length).toEqual(2);

    expect(links[0]).toHaveAttribute(
      'href',
      'http://foo.bar/en/web-interface.html#license-management',
    );

    expect(links[1]).toHaveAttribute('href', 'mailto:sales@greenbone.net');

    // License Information
    expect(element).toHaveTextContent('The license expires');
    expect(element).toHaveTextContent('in a month');
    expect(element).toHaveTextContent('Status');
    expect(element).toHaveTextContent('License is active');
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
    expect(element).toHaveTextContent('Expires on');
    expect(element).toHaveTextContent('Thu, Sep 9, 2021 7:05 AM UTC');
    expect(element).toHaveTextContent('Comment');
    expect(element).toHaveTextContent('Han shot first');
    expect(element).toHaveTextContent('Model');
    expect(element).toHaveTextContent('Greenbone Enterprise 450');
    expect(element).toHaveTextContent('Model Type');
    expect(element).toHaveTextContent('Hardware Appliance');

    // Headings
    const headings = getAllByRole('heading');
    expect(headings[0]).toHaveTextContent('License Management');
    expect(headings[1]).toHaveTextContent('Information');
    expect(headings[2]).toHaveTextContent('Model');
    expect(headings[3]).toHaveTextContent(
      'How to get a Greenbone Enterprise License',
    );
  });

  test('should render error dialog if no license could be loaded', async () => {
    const gmpRejected = {
      license: {
        getLicenseInformation: jest.fn(() => Promise.reject(new Error('foo'))),
      },
      settings: {
        manualUrl: 'http://foo.bar',
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      license: data,
      gmp: gmpRejected,
      router: true,
      store: true,
    });
    const {getByTestId} = render(<LicensePage />);

    store.dispatch(setTimezone('UTC'));

    await wait();

    const content = getByTestId('errordialog-content');

    expect(content).toHaveTextContent('foo');
  });
});
