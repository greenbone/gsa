/* Copyright (C) 2020-2021 Greenbone Networks GmbH
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

import {isDefined} from 'gmp/utils/identity';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';

import Filter from 'gmp/models/filter';
import TlsCertificate from 'gmp/models/tlscertificate';

import {entityLoadingActions} from 'web/store/entities/tlscertificates';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith} from 'web/utils/testing';

import Detailspage from '../detailspage';

if (!isDefined(window.URL)) {
  window.URL = {};
}
window.URL.createObjectURL = jest.fn();

setLocale('en');

const tlsCertificate = TlsCertificate.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  comment: 'bar',
  certificate: {
    __text: 'abcdefg12345',
    _format: 'DER',
  },
  issuer_dn: 'CN=LoremIpsum C=Dolor',
  activation_time: '2019-08-10T12:51:27Z',
  creation_time: '2019-07-10T12:51:27Z',
  expiration_time: '2019-09-10T12:51:27Z',
  modification_time: '2019-12-10T12:51:27Z',
  last_seen: '2019-10-10T12:51:27Z',
  serial: '123',
  sha256_fingerprint: '2142',
  md5_fingerprint: '4221',
  permissions: {permission: [{name: 'everything'}]},
});

const caps = new Capabilities(['everything']);

const reloadInterval = -1;
const manualUrl = 'test/';

let currentSettings;
let getEntities;

beforeEach(() => {
  currentSettings = jest.fn().mockResolvedValue({
    foo: 'bar',
  });

  getEntities = jest.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('TLS Certificate Detailspage tests', () => {
  test('should render full Detailspage', () => {
    const getTlsCertificate = jest.fn().mockResolvedValue({
      data: tlsCertificate,
    });

    const gmp = {
      tlscertificate: {
        get: getTlsCertificate,
      },
      permissions: {
        get: getEntities,
      },
      settings: {manualUrl, reloadInterval},
      user: {
        currentSettings,
      },
    };

    const {render, store} = rendererWith({
      capabilities: caps,
      gmp,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));
    store.dispatch(setUsername('admin'));

    store.dispatch(entityLoadingActions.success('1234', tlsCertificate));

    const {baseElement, element, getAllByTestId} = render(
      <Detailspage id="1234" />,
    );

    expect(element).toHaveTextContent('TLS Certificate: CN=LoremIpsum C=Dolor');

    const links = baseElement.querySelectorAll('a');
    const icons = getAllByTestId('svg-icon');

    expect(icons[0]).toHaveAttribute('title', 'Help: TLS Certificate Assets');
    expect(links[0]).toHaveAttribute(
      'href',
      'test/en/managing-assets.html#managing-tls-certificates',
    );

    expect(icons[1]).toHaveAttribute('title', 'TLS Certificates List');
    expect(links[1]).toHaveAttribute('href', '/tlscertificates');

    expect(element).toHaveTextContent('1234');
    expect(element).toHaveTextContent('Wed, Jul 10, 2019 12:51 PM UTC');
    expect(element).toHaveTextContent('Tue, Dec 10, 2019 12:51 PM UTC');
    expect(element).toHaveTextContent('admin');

    expect(element).toHaveTextContent('NameCN=LoremIpsum C=Dolor');
    expect(element).toHaveTextContent('ValidNo');
    expect(element).toHaveTextContent(
      'ActivatesSat, Aug 10, 2019 12:51 PM UTC',
    );
    expect(element).toHaveTextContent('ExpiresTue, Sep 10, 2019 12:51 PM UTC');
    expect(element).toHaveTextContent('SHA-256 Fingerprint2142');
    expect(element).toHaveTextContent('MD5 Fingerprint4221');
  });
});
