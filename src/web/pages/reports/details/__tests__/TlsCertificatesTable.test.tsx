/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen, within} from 'web/testing';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import TLSCertificatesTable from 'web/pages/reports/details/tls-certificate/TlsCertificatesTable';

const filter = Filter.fromString('rows=3 first=1');

const createGmp = () => ({
  session: createSession({timezone: 'CET'}),
});

describe('TLSCertificatesTable', () => {
  test('should show row details when Subject DN is clicked', () => {
    const reportTlsCertificates = getMockReport().tlsCertificates;

    if (!reportTlsCertificates) {
      throw new Error(
        'Mock report TLS certificates are required for this test',
      );
    }

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <TLSCertificatesTable
        // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
        entities={reportTlsCertificates.entities}
        entitiesCounts={reportTlsCertificates.counts}
        filter={filter}
        sortBy="dn"
        sortDir="asc"
      />,
    );

    const toggles = screen.getAllByTestId('row-details-toggle');
    fireEvent.click(toggles[0]);

    expect(
      screen.getByTestId(
        `tls-certificate-details-${reportTlsCertificates.entities[0].id}`,
      ),
    ).toBeInTheDocument();
  });

  test('should render table with expected columns and row values', () => {
    const reportTlsCertificates = getMockReport().tlsCertificates;

    if (!reportTlsCertificates) {
      throw new Error(
        'Mock report TLS certificates are required for this test',
      );
    }

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <TLSCertificatesTable
        // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
        entities={reportTlsCertificates.entities}
        entitiesCounts={reportTlsCertificates.counts}
        filter={filter}
        sortBy="dn"
        sortDir="asc"
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(columnHeaders.some(th => /DN/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Serial/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Activates/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Expires/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /IP/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Hostname/i.exec(th.textContent))).toBe(
      true,
    );
    expect(columnHeaders.some(th => /Port/i.exec(th.textContent))).toBe(true);
    expect(columnHeaders.some(th => /Actions/i.exec(th.textContent))).toBe(
      true,
    );

    expect(screen.getAllByText('CN=LoremIpsumSubject1 C=Dolor').length).toBe(1);
    expect(screen.getAllByText('00B49C541FF5A8E1D9').length).toBe(1);
    expect(screen.getAllByText('foo.bar').length).toBe(1);
    expect(screen.getByText(/4021/)).toBeInTheDocument();

    const [hostLink] = screen.getAllByRole('link', {name: '192.168.9.90'});
    expect(hostLink).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D192.168.9.90',
    );
    expect(hostLink).toHaveAttribute(
      'title',
      'Show all Hosts with IP 192.168.9.90',
    );
  });

  test('should call download click handler', () => {
    const reportTlsCertificates = getMockReport().tlsCertificates;

    if (!reportTlsCertificates) {
      throw new Error(
        'Mock report TLS certificates are required for this test',
      );
    }

    const onTlsCertificateDownloadClick = testing.fn();

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <TLSCertificatesTable
        // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
        entities={reportTlsCertificates.entities}
        entitiesCounts={reportTlsCertificates.counts}
        filter={filter}
        sortBy="dn"
        sortDir="asc"
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const downloadIcons = screen.getAllByTestId('download-icon');
    fireEvent.click(downloadIcons[0]);

    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      reportTlsCertificates.entities[0],
    );
  });

  test('should render table without actions column when disabled', () => {
    const reportTlsCertificates = getMockReport().tlsCertificates;

    if (!reportTlsCertificates) {
      throw new Error(
        'Mock report TLS certificates are required for this test',
      );
    }

    const {render} = rendererWith({
      gmp: createGmp(),
    });

    render(
      <TLSCertificatesTable
        actions={false}
        // @ts-expect-error entities are ReportTLSCertificate[], not Model[]
        entities={reportTlsCertificates.entities}
        entitiesCounts={reportTlsCertificates.counts}
        filter={filter}
        sortBy="dn"
        sortDir="asc"
      />,
    );

    const table = screen.getByRole('table');
    const columnHeaders = within(table).getAllByRole('columnheader');

    expect(columnHeaders).toHaveLength(7);
    expect(columnHeaders.some(th => /Actions/i.exec(th.textContent))).toBe(
      false,
    );
    expect(screen.queryByTestId('download-icon')).not.toBeInTheDocument();
  });
});
