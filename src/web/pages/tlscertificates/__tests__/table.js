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

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import TlsCertificate from 'gmp/models/tlscertificate';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Table from '../table';

setLocale('en');

const caps = new Capabilities(['everything']);

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
  expiration_time: '2019-09-10T12:51:27Z',
  last_seen: '2019-10-10T12:51:27Z',
  serial: '123',
  sha256_fingerprint: '2142',
  md5_fingerprint: '4221',
  permissions: {permission: [{name: 'everything'}]},
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 1,
});

const filter = Filter.fromString('rows=2');

describe('TlsCertificates table tests', () => {
  test('should render', () => {
    const handleTlsCertificateDelete = jest.fn();
    const handleTlsCertificateDownload = jest.fn();
    const handleTlsCertificateExport = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <Table
        filter={filter}
        entities={[tlsCertificate]}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Issuer DN');
    expect(header[1]).toHaveTextContent('Serial');
    expect(header[2]).toHaveTextContent('Activates');
    expect(header[3]).toHaveTextContent('Expires');
    expect(header[4]).toHaveTextContent('Last seen');
    expect(header[5]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleTlsCertificateDelete = jest.fn();
    const handleTlsCertificateDownload = jest.fn();
    const handleTlsCertificateExport = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {element, getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[tlsCertificate]}
        entitiesCounts={counts}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    expect(element).not.toHaveTextContent('Valid');
    expect(element).not.toHaveTextContent('SHA-256 Fingerprint');
    expect(element).not.toHaveTextContent('MD5 Fingerprint');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('Valid');
    expect(element).toHaveTextContent('SHA-256 Fingerprint');
    expect(element).toHaveTextContent('MD5 Fingerprint');
  });

  test('should call click handlers', () => {
    const handleTlsCertificateDelete = jest.fn();
    const handleTlsCertificateDownload = jest.fn();
    const handleTlsCertificateExport = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const gmp = {
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setUsername('admin'));

    const {getAllByTestId} = render(
      <Table
        filter={filter}
        entities={[tlsCertificate]}
        entitiesCounts={counts}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[5]);
    expect(icons[5]).toHaveAttribute('title', 'Delete TLS Certificate');
    expect(handleTlsCertificateDelete).toHaveBeenCalledWith(tlsCertificate);

    fireEvent.click(icons[6]);
    expect(icons[6]).toHaveAttribute('title', 'Download TLS Certificate');
    expect(handleTlsCertificateDownload).toHaveBeenCalledWith(tlsCertificate);

    fireEvent.click(icons[7]);
    expect(icons[7]).toHaveAttribute('title', 'Export TLS Certificate as XML');
    expect(handleTlsCertificateDownload).toHaveBeenCalledWith(tlsCertificate);
  });
});
