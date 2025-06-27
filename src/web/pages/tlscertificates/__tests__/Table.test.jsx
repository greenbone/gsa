/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Filter from 'gmp/models/filter';
import TlsCertificate from 'gmp/models/tlscertificate';
import Table from 'web/pages/tlscertificates/Table';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const caps = new Capabilities(['everything']);

const tlsCertificate = TlsCertificate.fromElement({
  _id: '1234',
  owner: {name: 'admin'},
  comment: 'bar',
  certificate: {
    __text: 'abcdefg12345',
    _format: 'DER',
  },
  issuer_dn: 'CN=LoremIpsumIssuer C=Dolor',
  subject_dn: 'CN=LoremIpsumSubject C=Dolor',
  activation_time: '2019-08-10T12:51:27Z',
  expiration_time: '2019-09-10T12:51:27Z',
  last_seen: '2019-10-10T12:51:27Z',
  serial: '123',
  sha256_fingerprint: '2142',
  md5_fingerprint: '4221',
  valid: 1,
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
    const handleTlsCertificateDelete = testing.fn();
    const handleTlsCertificateDownload = testing.fn();
    const handleTlsCertificateExport = testing.fn();

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

    render(
      <Table
        entities={[tlsCertificate]}
        filter={filter}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
      />,
    );

    const header = screen.getByTestId('tls-certificates-table-header');
    const heads = header.querySelectorAll('th');
    expect(heads[0]).toHaveTextContent('Subject DN');
    expect(heads[1]).toHaveTextContent('Serial');
    expect(heads[2]).toHaveTextContent('Activates');
    expect(heads[3]).toHaveTextContent('Expires');
    expect(heads[4]).toHaveTextContent('Last seen');
    expect(heads[5]).toHaveTextContent('Actions');
  });

  test('should unfold all details', () => {
    const handleTlsCertificateDelete = testing.fn();
    const handleTlsCertificateDownload = testing.fn();
    const handleTlsCertificateExport = testing.fn();
    const handleToggleDetailsClick = testing.fn();

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

    render(
      <Table
        entities={[tlsCertificate]}
        entitiesCounts={counts}
        filter={filter}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    let details = screen.queryByTestId('tls-certificate-details-1234');
    expect(details).not.toBeInTheDocument();

    const unfoldIcon = screen.getByTestId('fold-state-icon-unfold');
    expect(unfoldIcon).toHaveAttribute('title', 'Unfold all details');
    fireEvent.click(unfoldIcon);

    details = screen.getByTestId('tls-certificate-details-1234');
    expect(details).toHaveTextContent('Valid');
    expect(details).toHaveTextContent('SHA-256 Fingerprint');
    expect(details).toHaveTextContent('MD5 Fingerprint');
  });

  test('should call click handlers', () => {
    const handleTlsCertificateDelete = testing.fn();
    const handleTlsCertificateDownload = testing.fn();
    const handleTlsCertificateExport = testing.fn();
    const handleToggleDetailsClick = testing.fn();

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

    render(
      <Table
        entities={[tlsCertificate]}
        entitiesCounts={counts}
        filter={filter}
        onTlsCertificateDeleteClick={handleTlsCertificateDelete}
        onTlsCertificateDownloadClick={handleTlsCertificateDownload}
        onTlsCertificateExportClick={handleTlsCertificateExport}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const deleteIcon = screen.getAllByTestId('delete-icon')[0];
    fireEvent.click(deleteIcon);
    expect(deleteIcon).toHaveAttribute('title', 'Delete TLS Certificate');
    expect(handleTlsCertificateDelete).toHaveBeenCalledWith(tlsCertificate);

    const downloadIcon = screen.getByTestId('download-icon');
    fireEvent.click(downloadIcon);
    expect(downloadIcon).toHaveAttribute('title', 'Download TLS Certificate');
    expect(handleTlsCertificateDownload).toHaveBeenCalledWith(tlsCertificate);

    const exportIcon = screen.getAllByTestId('export-icon')[0];
    fireEvent.click(exportIcon);
    expect(exportIcon).toHaveAttribute(
      'title',
      'Export TLS Certificate as XML',
    );
    expect(handleTlsCertificateDownload).toHaveBeenCalledWith(tlsCertificate);
  });
});
