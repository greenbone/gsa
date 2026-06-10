/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import TLSCertificatesTab from 'web/pages/reports/details/tls-certificate/TlsCertificatesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=3 min_qod=70 first=1 sort-reverse=severity',
);
const {tlsCertificates: mockTlsCertificates} = getMockReport();
const tlsCertificates = mockTlsCertificates?.entities ?? [];
const tlsCertificatesCounts =
  mockTlsCertificates?.counts ??
  new CollectionCounts({
    first: 1,
    all: tlsCertificates.length,
    filtered: tlsCertificates.length,
    length: tlsCertificates.length,
    rows: tlsCertificates.length,
  });

const tlsCertificatesData = {
  entities: tlsCertificates,
  entitiesCounts: tlsCertificatesCounts,
};

describe('Report TLS Certificates Tab tests', () => {
  test('should render Report TLS Certificates Tab', async () => {
    const reportId = 'report-id-1234';

    const onTlsCertificateDownloadClick = testing.fn();

    const {render} = rendererWith({
      gmp: {
        session: createSession({timezone: 'CET'}),
      },
    });

    render(
      <TLSCertificatesTab
        reportFilter={filter}
        reportId={reportId}
        tlsCertificatesData={tlsCertificatesData}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const table = await screen.findByRole('table');
    const header = within(table).getAllByRole('columnheader');

    // Headings
    expect(header[0]).toHaveTextContent('DN');
    expect(header[1]).toHaveTextContent('Serial');
    expect(header[2]).toHaveTextContent('Activates');
    expect(header[3]).toHaveTextContent('Expires');
    expect(header[4]).toHaveTextContent('IP');
    expect(header[5]).toHaveTextContent('Hostname');
    expect(header[6]).toHaveTextContent('Port');
    expect(header[7]).toHaveTextContent('Actions');

    // Filter (component overrides sort to sort-reverse=dn)
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    expect(screen.getByText(/Applied filter:/)).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=3 min_qod=70 first=1 sort-reverse=dn)',
    );
  });

  test('should call click handler', async () => {
    const onTlsCertificateDownloadClick = testing.fn();

    const {render} = rendererWith({
      gmp: {
        session: createSession({timezone: 'CET'}),
      },
    });

    render(
      <TLSCertificatesTab
        reportFilter={filter}
        reportId="report-id-1234"
        tlsCertificatesData={tlsCertificatesData}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const downloadIcons = await screen.findAllByTestId('download-icon');

    fireEvent.click(downloadIcons[0]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalled();

    fireEvent.click(downloadIcons[1]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalled();
  });
});
