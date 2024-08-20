/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import Capabilities from 'gmp/capabilities/capabilities';
import CollectionCounts from 'gmp/collection/collectioncounts';
import {parseDate} from 'gmp/parser';

import Filter from 'gmp/models/filter';
import Cve from 'gmp/models/cve';

import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, fireEvent} from 'web/utils/testing';

import CveTable from '../table';

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
        filter={filter}
        entities={[entity, entity2, entity3, entity_v3]}
        entitiesCounts={counts}
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

    const {element, getAllByTestId} = render(
      <CveTable
        filter={filter}
        entities={[entity, entity2, entity3, entity_v3]}
        entitiesCounts={counts}
      />,
    );

    expect(element).not.toHaveTextContent('Availability ImpactCOMPLETE');
    expect(element).not.toHaveTextContent('Confidentiality ImpactPARTIAL');
    expect(element).not.toHaveTextContent('Attack VectorLOCAL');

    const icons = getAllByTestId('svg-icon');
    fireEvent.click(icons[0]);
    expect(icons[0]).toHaveAttribute('title', 'Unfold all details');
    expect(element).toHaveTextContent('Availability ImpactCOMPLETE');
    expect(element).toHaveTextContent('Confidentiality ImpactPARTIAL');
    expect(element).toHaveTextContent('Attack VectorLOCAL');
  });
});
