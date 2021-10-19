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
/* eslint-disable no-console */
import React from 'react';

import {setLocale} from 'gmp/locale/lang';

import TlsCertificate from 'gmp/models/tlscertificate';

import {setTimezone} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import Row from '../row';

setLocale('en');

const gmp = {settings: {}};

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

describe('Tls Certificate Row tests', () => {
  // deactivate console.error for tests
  // to make it possible to test a row without a table
  const consoleError = console.error;
  console.error = () => {};

  test('should render', () => {
    const handleTlsCertificateDelete = jest.fn();
    const handleTlsCertificateDownload = jest.fn();
    const handleTlsCertificateExport = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={tlsCertificate}
        links={true}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Info
    expect(baseElement).toHaveTextContent('CN=LoremIpsum C=Dolor');
    expect(baseElement).toHaveTextContent('123');
    expect(baseElement).toHaveTextContent('Sat, Aug 10, 2019 12:51 PM UTC');
    expect(baseElement).toHaveTextContent('Tue, Sep 10, 2019 12:51 PM UTC');
    expect(baseElement).toHaveTextContent('Thu, Oct 10, 2019 12:51 PM UTC');

    // Actions
    const icons = getAllByTestId('svg-icon');
    expect(icons.length).toEqual(3);
  });

  test('should render icons', () => {
    const handleReportImport = jest.fn();
    const handleTlsCertificateDelete = jest.fn();
    const handleTlsCertificateDownload = jest.fn();
    const handleTlsCertificateExport = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({gmp, store: true});

    store.dispatch(setTimezone('UTC'));

    const {getAllByTestId} = render(
      <Row
        entity={tlsCertificate}
        links={true}
        onReportImportClick={handleReportImport}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const icons = getAllByTestId('svg-icon');
    expect(icons[0]).toHaveAttribute('title', 'Delete TLS Certificate');
    expect(icons[1]).toHaveAttribute('title', 'Download TLS Certificate');
    expect(icons[2]).toHaveAttribute('title', 'Export TLS Certificate as XML');
  });

  test('should call click handlers', () => {
    const handleTlsCertificateDelete = jest.fn();
    const handleTlsCertificateDownload = jest.fn();
    const handleTlsCertificateExport = jest.fn();
    const handleToggleDetailsClick = jest.fn();

    const {render, store} = rendererWith({
      gmp,
      store: true,
    });

    store.dispatch(setTimezone('UTC'));

    const {baseElement, getAllByTestId} = render(
      <Row
        entity={tlsCertificate}
        links={true}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    // Name
    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(undefined, '1234');

    // Actions
    const icons = getAllByTestId('svg-icon');

    fireEvent.click(icons[0]);
    expect(handleTlsCertificateDelete).toHaveBeenCalledWith(tlsCertificate);

    fireEvent.click(icons[1]);
    expect(handleTlsCertificateDownload).toHaveBeenCalledWith(tlsCertificate);

    fireEvent.click(icons[2]);
    expect(handleTlsCertificateExport).toHaveBeenCalledWith(tlsCertificate);
  });

  console.warn = consoleError;
});
