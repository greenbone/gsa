/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWithTable, fireEvent, screen} from 'web/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import Filter from 'gmp/models/filter.js';
import NVT from 'gmp/models/nvt';
import Row from 'web/pages/nvts/Row';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

const gmp = {settings: {}};
const caps = new Capabilities(['everything']);

const entity = NVT.fromElement({
  _oid: '1.3.6.1.4.1.25623.1.0',
  name: 'foo',
  creation_time: '2019-06-24T11:55:30Z',
  modification_time: '2019-06-24T10:12:27Z',
  family: 'bar',
  cvss_base: 5,
  qod: {value: 80},
  tags: 'This is a description|solution_type=VendorFix',
  solution: {
    _type: 'VendorFix',
    __text: 'This is a description',
  },
  epss: {
    max_severity: {
      score: 0.8765,
      percentile: 90.0,
      cve: {
        _id: 'CVE-2020-1234',
        severity: 10.0,
      },
    },
    max_epss: {
      score: 0.9876,
      percentile: 80.0,
      cve: {
        _id: 'CVE-2020-5678',
      },
    },
  },
  refs: {
    ref: [
      {_type: 'cve', _id: 'CVE-2020-1234'},
      {_type: 'cve', _id: 'CVE-2020-5678'},
    ],
  },
});

describe('NVT row tests', () => {
  test('should render', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleFilterChanged = testing.fn();

    const {render, store} = rendererWithTable({
      gmp,
      capabilities: caps,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('username'));

    const {baseElement} = render(
      <Row
        entity={entity}
        onFilterChanged={handleFilterChanged}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const bars = screen.getAllByTestId('progressbar-box');
    const links = baseElement.querySelectorAll('a');

    expect(baseElement).toHaveTextContent('foo');

    expect(links[0]).toHaveAttribute('href', '/nvts?filter=family%3D%22bar%22');
    expect(links[0]).toHaveTextContent('bar');

    expect(baseElement).toHaveTextContent(
      'Mon, Jun 24, 2019 1:55 PM Central European Summer Time',
    );
    expect(baseElement).toHaveTextContent(
      'Mon, Jun 24, 2019 12:12 PM Central European Summer Time',
    );

    expect(links[1]).toHaveAttribute('href', '/cve/CVE-2020-1234');
    expect(links[1]).toHaveTextContent('CVE-2020-1234');

    expect(links[2]).toHaveAttribute('href', '/cve/CVE-2020-5678');
    expect(links[2]).toHaveTextContent('CVE-2020-5678');

    expect(bars[0]).toHaveAttribute('title', 'Medium');
    expect(bars[0]).toHaveTextContent('5.0 (Medium)');

    expect(baseElement).toHaveTextContent('80 %');
  });

  test('should call click handlers', () => {
    const handleToggleDetailsClick = testing.fn();
    const handleFilterChanged = testing.fn();

    const filter = Filter.fromString('family="bar"');

    const {render} = rendererWithTable({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    const {baseElement} = render(
      <Row
        entity={entity}
        onFilterChanged={handleFilterChanged}
        onToggleDetailsClick={handleToggleDetailsClick}
      />,
    );

    const spans = baseElement.querySelectorAll('span');
    fireEvent.click(spans[1]);
    expect(handleToggleDetailsClick).toHaveBeenCalledWith(
      undefined,
      '1.3.6.1.4.1.25623.1.0',
    );

    const links = baseElement.querySelectorAll('a');
    fireEvent.click(links[0]);
    expect(handleFilterChanged).toHaveBeenCalledWith(filter);
  });
});
