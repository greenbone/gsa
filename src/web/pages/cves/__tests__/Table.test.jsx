/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/CollectionCounts';
import Cve from 'gmp/models/cve';
import Filter from 'gmp/models/filter';
import {parseDate} from 'gmp/parser';
import CveTable from 'web/pages/cves/Table';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {screen} from 'web/testing';
import {rendererWith, fireEvent} from 'web/utils/Testing';

const caps = new Capabilities(['everything']);

const entity = Cve.fromElement({
  _id: 'CVE-2020-9992',
  name: 'CVE-2020-9992',
  cvss_vector: 'AV:N/AC:M/Au:N/C:C/I:C/A:C',
  creationTime: parseDate('2020-10-22T19:15:00Z'),
  score: '93',
  description: 'foo bar baz',
  usage_type: 'cve',
});

const entity2 = Cve.fromElement({
  _id: 'CVE-2020-9983',
  name: 'CVE-2020-9983',
  cvss_vector: 'AV:N/AC:M/Au:N/C:P/I:P/A:P',
  creationTime: parseDate('2019-06-24T10:12:27Z'),
  score: '93',
  description: 'foo bar baz',
  usage_type: 'cve',
});

const entity3 = Cve.fromElement({
  _id: 'CVE-2020-9976',
  name: 'CVE-2020-9976',
  cvss_vector: 'AV:N/AC:M/Au:N/C:P/I:P/A:P',
  creationTime: parseDate('2020-09-10T12:51:27Z'),
  score: '93',
  description: 'foo bar baz',
  usage_type: 'cve',
});

const entity_v3 = Cve.fromElement({
  _id: 'CVE-2020-9997',
  name: 'CVE-2020-9997',
  cvss_vector: 'CVSS:3.1/AV:L/AC:L/PR:N/UI:R/S:U/C:N/I:H/A:H',
  creationTime: parseDate('2020-10-22T19:15:00Z'),
  score: '71',
  description: 'foo bar baz',
  usage_type: 'cve',
});

const counts = new CollectionCounts({
  first: 1,
  all: 1,
  filtered: 1,
  length: 1,
  rows: 3,
});

const filter = Filter.fromString('rows=2');

describe('Cve table tests', () => {
  test('should render', () => {
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
      <CveTable
        entities={[entity, entity2, entity3, entity_v3]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    const header = baseElement.querySelectorAll('th');
    expect(header[0]).toHaveTextContent('Name');
    expect(header[1]).toHaveTextContent('Description');
    expect(header[2]).toHaveTextContent('Published');
    expect(header[3]).toHaveTextContent('CVSS Base Vector');
    expect(header[4]).toHaveTextContent('Severity');
  });

  test('should unfold all details', () => {
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

    const {element} = render(
      <CveTable
        entities={[entity, entity2, entity3, entity_v3]}
        entitiesCounts={counts}
        filter={filter}
      />,
    );

    expect(element).not.toHaveTextContent('Availability ImpactComplete');
    expect(element).not.toHaveTextContent('Confidentiality ImpactPartial');
    expect(element).not.toHaveTextContent('Attack VectorLocal');

    const unfoldIcon = screen.getByTestId('fold-state-icon-unfold');
    fireEvent.click(unfoldIcon);
    expect(unfoldIcon).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('Availability ImpactComplete');
    expect(element).toHaveTextContent('Confidentiality ImpactPartial');
    expect(element).toHaveTextContent('Attack VectorLocal');
  });
});
