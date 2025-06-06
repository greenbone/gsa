/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, fireEvent} from 'web/testing';
import Filter from 'gmp/models/filter';
import {getMockReport} from 'web/pages/reports/__mocks__/MockReport';
import TLSCertificatesTab from 'web/pages/reports/details/TlsCertificatesTab';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=3 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report TLS Certificates Tab tests', () => {
  test('should render Report TLS Certificates Tab', () => {
    const {tlsCertificates} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();
    const onTlsCertificateDownloadClick = testing.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <TLSCertificatesTab
        counts={tlsCertificates.counts}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        tlsCertificates={tlsCertificates.entities}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const links = baseElement.querySelectorAll('a');
    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');

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
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=3 min_qod=70 first=1 sort-reverse=severity)',
    );
  });

  test('should call click handler', () => {
    const {tlsCertificates} = getMockReport();

    const onSortChange = testing.fn();
    const onInteraction = testing.fn();
    const onTlsCertificateDownloadClick = testing.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <TLSCertificatesTab
        counts={tlsCertificates.counts}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        tlsCertificates={tlsCertificates.entities}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    fireEvent.click(icons[11]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      tlsCertificates.entities[0],
    );

    fireEvent.click(icons[12]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      tlsCertificates.entities[1],
    );
  });
});
