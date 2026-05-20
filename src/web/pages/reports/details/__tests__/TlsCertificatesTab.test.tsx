/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {act, rendererWith, fireEvent, screen, within} from 'web/testing';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import {createSession} from 'gmp/testing';
import {getMockReport} from 'web/pages/reports/__fixtures__/MockReport';
import TLSCertificatesTab from 'web/pages/reports/details/TlsCertificatesTab';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=3 min_qod=70 first=1 sort-reverse=severity',
);
const tlsCertificates = getMockReport().tlsCertificates?.entities ?? [];
const reloadIntervalActive = 2000;

const createGmp = ({
  getReportTlsCertificates = testing.fn().mockResolvedValue({
    data: tlsCertificates,
    meta: {
      filter,
      counts: new CollectionCounts({
        first: 1,
        all: tlsCertificates.length,
        filtered: tlsCertificates.length,
        length: tlsCertificates.length,
        rows: tlsCertificates.length,
      }),
    },
  }),
} = {}) => ({
  reporttlscertificates: {
    get: getReportTlsCertificates,
  },
  settings: {
    reloadInterval: 5000,
    reloadIntervalActive: 2000,
    reloadIntervalInactive: 10000,
  },
  session: createSession({
    timezone: 'CET',
    token: 'test-token',
    username: 'admin',
  }),
});

describe('Report TLS Certificates Tab tests', () => {
  test('should render Report TLS Certificates Tab', async () => {
    const reportId = 'report-id-1234';

    const onTlsCertificateDownloadClick = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({
      router: true,
      gmp,
    });

    render(
      <TLSCertificatesTab
        reportFilter={filter}
        reportId={reportId}
        status="Done"
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const table = await screen.findByRole('table');
    const header = within(table).getAllByRole('columnheader');
    const rows = within(table).getAllByRole('row');
    const links = within(table).getAllByRole('link');

    // Headings
    expect(header[0]).toHaveTextContent('DN');
    expect(header[1]).toHaveTextContent('Serial');
    expect(header[2]).toHaveTextContent('Activates');
    expect(header[3]).toHaveTextContent('Expires');
    expect(header[4]).toHaveTextContent('IP');
    expect(header[5]).toHaveTextContent('Hostname');
    expect(header[6]).toHaveTextContent('Port');
    expect(header[7]).toHaveTextContent('Actions');

    // Row 1
    expect(rows[1]).toHaveTextContent('CN=LoremIpsumSubject1 C=Dolor');
    expect(rows[1]).toHaveTextContent('00B49C541FF5A8E1D9');
    expect(rows[1]).toHaveTextContent('Sat, Aug 10, 2019');
    expect(rows[1]).toHaveTextContent('Tue, Sep 10, 2019');

    expect(links[1]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D192.168.9.90',
    );
    expect(links[1]).toHaveAttribute(
      'title',
      'Show all Hosts with IP 192.168.9.90',
    );
    expect(links[1]).toHaveTextContent('192.168.9.90');
    expect(rows[1]).toHaveTextContent('foo.bar');
    expect(rows[1]).toHaveTextContent('4021');

    // Row 2
    expect(rows[2]).toHaveTextContent('CN=LoremIpsumSubject1 C=Dolor');
    expect(rows[2]).toHaveTextContent('00B49C541FF5A8E1D9');
    expect(rows[2]).toHaveTextContent('Sat, Aug 10, 2019');
    expect(rows[2]).toHaveTextContent('Tue, Sep 10, 2019');
    expect(links[1]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D192.168.9.90',
    );
    expect(links[1]).toHaveAttribute(
      'title',
      'Show all Hosts with IP 192.168.9.90',
    );
    expect(links[1]).toHaveTextContent('192.168.9.90');
    expect(rows[2]).toHaveTextContent('foo.bar');
    expect(rows[2]).toHaveTextContent('4023');

    // Row 3
    expect(rows[3]).toHaveTextContent('CN=LoremIpsumSubject2 C=Dolor');
    expect(rows[3]).toHaveTextContent('00C387C32CBB861F5C');
    expect(links[2]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D191.164.9.93',
    );
    expect(links[2]).toHaveAttribute(
      'title',
      'Show all Hosts with IP 191.164.9.93',
    );
    expect(links[2]).toHaveTextContent('191.164.9.93');
    expect(rows[3]).toHaveTextContent('8445');

    // Filter
    expect(screen.getByTestId('entities-table')).toBeInTheDocument();
    expect(screen.getByText(/Applied filter:/)).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=3 min_qod=70 first=1 sort-reverse=severity)',
    );

    expect(gmp.reporttlscertificates.get).toHaveBeenCalledWith(
      expect.objectContaining({report_id: reportId}),
    );
  });

  test('should call click handler', async () => {
    const onTlsCertificateDownloadClick = testing.fn();

    const gmp = createGmp();
    const {render} = rendererWith({
      router: true,
      gmp,
    });

    render(
      <TLSCertificatesTab
        reportFilter={filter}
        reportId="report-id-1234"
        status="Done"
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const downloadIcons = await screen.findAllByTestId('download-icon');

    fireEvent.click(downloadIcons[0]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      tlsCertificates[0],
    );

    fireEvent.click(downloadIcons[1]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      tlsCertificates[1],
    );
  });

  describe('TLS Certificates polling behavior isActive status', () => {
    test.each([
      [
        'should poll TLS certificates when task status is active',
        'Running',
        reloadIntervalActive + 50,
        2,
      ],
      [
        'should not poll TLS certificates when task status is not active',
        'Stopped',
        reloadIntervalActive * 10,
        1,
      ],
    ])('%s', async (_, status, timeToAdvance, expectedCallCount) => {
      testing.useFakeTimers();

      const getReportTlsCertificates = testing.fn().mockResolvedValue({
        data: tlsCertificates,
        meta: {
          filter,
          counts: new CollectionCounts({
            first: 1,
            all: tlsCertificates.length,
            filtered: tlsCertificates.length,
            length: tlsCertificates.length,
            rows: tlsCertificates.length,
          }),
        },
      });
      const gmp = createGmp({getReportTlsCertificates});
      const {render} = rendererWith({router: true, gmp});

      render(
        <TLSCertificatesTab
          reportFilter={filter}
          reportId="report-id-1234"
          status={status as 'Running' | 'Stopped'}
          onTlsCertificateDownloadClick={testing.fn()}
        />,
      );

      await act(async () => {});
      expect(getReportTlsCertificates).toHaveBeenCalledTimes(1);

      await act(async () => {
        await testing.advanceTimersByTimeAsync(timeToAdvance);
      });

      expect(getReportTlsCertificates).toHaveBeenCalledTimes(expectedCallCount);

      testing.useRealTimers();
    });
  });
});
