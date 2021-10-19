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

import Filter from 'gmp/models/filter';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import {getMockReport} from 'web/pages/reports/__mocks__/mockreport';

import TLSCertificatesTab from '../tlscertificatestab';

setLocale('en');

const filter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

describe('Report TLS Certificates Tab tests', () => {
  test('should render Report TLS Certificates Tab', () => {
    const {tlsCertificates} = getMockReport();

    const onSortChange = jest.fn();
    const onInteraction = jest.fn();
    const onTlsCertificateDownloadClick = jest.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <TLSCertificatesTab
        counts={tlsCertificates.counts}
        tlsCertificates={tlsCertificates.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');
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
    expect(rows[1]).toHaveTextContent('CN=foo');
    expect(rows[1]).toHaveTextContent('abcd');
    expect(rows[1]).toHaveTextContent('Wed, Jan 30, 2019');
    expect(rows[1]).toHaveTextContent('Thu, Aug 1, 2019');
    expect(links[7]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D123.456.78.910',
    );
    expect(links[7]).toHaveAttribute(
      'title',
      'Show all Hosts with IP 123.456.78.910',
    );
    expect(links[7]).toHaveTextContent('123.456.78.910');
    expect(rows[1]).toHaveTextContent('foo.bar');
    expect(rows[1]).toHaveTextContent('1234');
    expect(icons[4]).toHaveTextContent('download.svg');

    // Row 2
    expect(rows[2]).toHaveTextContent('CN=bar');
    expect(rows[2]).toHaveTextContent('dcba');
    expect(rows[2]).toHaveTextContent('Sat, Mar 30, 2019');
    expect(rows[2]).toHaveTextContent('Tue, Oct 1, 2019');
    expect(links[8]).toHaveAttribute(
      'href',
      '/hosts?filter=name%3D109.876.54.321',
    );
    expect(links[8]).toHaveAttribute(
      'title',
      'Show all Hosts with IP 109.876.54.321',
    );
    expect(links[8]).toHaveTextContent('109.876.54.321');
    expect(rows[2]).toHaveTextContent('lorem.ipsum');
    expect(rows[2]).toHaveTextContent('5678');
    expect(icons[5]).toHaveTextContent('download.svg');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });

  test('should call click handler', () => {
    const {tlsCertificates} = getMockReport();

    const onSortChange = jest.fn();
    const onInteraction = jest.fn();
    const onTlsCertificateDownloadClick = jest.fn();

    const {render, store} = rendererWith({
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const {baseElement} = render(
      <TLSCertificatesTab
        counts={tlsCertificates.counts}
        tlsCertificates={tlsCertificates.entities}
        filter={filter}
        isUpdating={false}
        sortField={'severity'}
        sortReverse={true}
        onInteraction={onInteraction}
        onSortChange={onSortChange}
        onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(icons[4]).toHaveTextContent('download.svg');
    fireEvent.click(icons[4]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      tlsCertificates.entities[0],
    );

    expect(icons[5]).toHaveTextContent('download.svg');
    fireEvent.click(icons[5]);
    expect(onTlsCertificateDownloadClick).toHaveBeenCalledWith(
      tlsCertificates.entities[1],
    );
  });
});
