/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import CollectionCounts from 'gmp/collection/collectioncounts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import React from 'react';
import ResultsTab from 'web/pages/reports/details/ResultsTab';
import {entitiesLoadingActions} from 'web/store/entities/results';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';
import {rendererWith, wait} from 'web/utils/Testing';


const reloadInterval = 1;
const manualUrl = 'test/';

// mock entities
export const result1 = Result.fromElement({
  _id: '101',
  name: 'Result 1',
  owner: {name: 'admin'},
  comment: 'Comment 1',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '123.456.78.910', hostname: 'foo'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
  },
  threat: 'High',
  severity: 10.0,
  qod: {value: 80},
  compliance: 'yes',
});

export const result2 = Result.fromElement({
  _id: '102',
  name: 'Result 2',
  owner: {name: 'admin'},
  comment: 'Comment 2',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321'},
  port: '80/tcp',
  nvt: {
    _oid: '202',
    type: 'nvt',
    name: 'nvt2',
    tags: 'solution_type=VendorFix',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-5678'}]},
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 70},
  compliance: 'no',
});

export const result3 = Result.fromElement({
  _id: '103',
  name: 'Result 3',
  owner: {name: 'admin'},
  comment: 'Comment 3',
  creation_time: '2019-06-03T11:06:31Z',
  modification_time: '2019-06-03T11:06:31Z',
  host: {__text: '109.876.54.321', hostname: 'bar'},
  port: '80/tcp',
  nvt: {
    _oid: '201',
    type: 'nvt',
    name: 'nvt1',
    tags: 'solution_type=Mitigation',
    refs: {ref: [{_type: 'cve', _id: 'CVE-2019-1234'}]},
    solution: {
      _type: 'Mitigation',
    },
  },
  threat: 'Medium',
  severity: 5.0,
  qod: {value: 80},
  compliance: 'incomplete',
});

const results = [result1, result2, result3];

let currentSettings;
let getAggregates;
let getDashboardSetting;
let getFilters;
let getResults;

beforeEach(() => {
  // mock gmp commands

  getResults = testing.fn().mockResolvedValue({
    data: results,
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getFilters = testing.fn().mockReturnValue(
    Promise.resolve({
      data: [],
      meta: {
        filter: Filter.fromString(),
        counts: new CollectionCounts(),
      },
    }),
  );

  getDashboardSetting = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });

  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  });
});

describe('Report Results Tab tests', () => {
  test('should render Results Tab with compliance information', async () => {
    const reload = testing.fn();
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();
    const onTargetEditClick = testing.fn();

    const gmp = {
      results: {
        get: getResults,
        getSeverityAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('result', defaultSettingfilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success(results, filter, loadedFilter, counts),
    );

    const {baseElement} = render(
      <ResultsTab
        audit={true}
        isLoading={true}
        progress={100}
        reload={reload}
        reportFilter={filter}
        reportId={'123'}
        results={results}
        resultsFilter={filter}
        status={'Stopped'}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    await wait();

    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');

    expect(header[0]).toHaveTextContent('Vulnerability');
    expect(header[2]).toHaveTextContent('Compliant');
    expect(header[3]).toHaveTextContent('QoD');
    expect(header[4]).toHaveTextContent('Host');
    expect(header[5]).toHaveTextContent('Location');
    expect(header[6]).toHaveTextContent('Created');
    expect(header[7]).toHaveTextContent('IP');
    expect(header[8]).toHaveTextContent('Name');

    expect(row[2]).toHaveTextContent('Result 1');
    expect(row[2]).toHaveTextContent('Yes');
    expect(row[2]).toHaveTextContent('80 %');
    expect(row[2]).toHaveTextContent('123.456.78.910');
    expect(row[2]).toHaveTextContent('foo');
    expect(row[2]).toHaveTextContent('80/tcp');
    expect(row[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    expect(row[3]).toHaveTextContent('Result 2');
    expect(row[3]).toHaveTextContent('No');
    expect(row[3]).toHaveTextContent('70 %');
    expect(row[3]).toHaveTextContent('109.876.54.321');
    expect(row[3]).toHaveTextContent('80/tcp');
    expect(row[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    expect(row[4]).toHaveTextContent('Result 3');
    expect(row[4]).toHaveTextContent('Incomplete');
    expect(row[4]).toHaveTextContent('80 %');
    expect(row[4]).toHaveTextContent('109.876.54.321');
    expect(row[4]).toHaveTextContent('bar');
    expect(row[4]).toHaveTextContent('80/tcp');
    expect(row[4]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');
  });

  test('should render Results Tab with compliance information', async () => {
    const reload = testing.fn();
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();
    const onTargetEditClick = testing.fn();

    const gmp = {
      results: {
        get: getResults,
        getSeverityAggregates: getAggregates,
        getWordCountsAggregates: getAggregates,
      },
      filters: {
        get: getFilters,
      },
      dashboard: {
        getSetting: getDashboardSetting,
      },
      settings: {manualUrl, reloadInterval},
      user: {currentSettings},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      store: true,
      router: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const defaultSettingfilter = Filter.fromString('foo=bar');
    store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
    store.dispatch(
      defaultFilterLoadingActions.success('result', defaultSettingfilter),
    );

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    const filter = Filter.fromString('first=1 rows=10');
    const loadedFilter = Filter.fromString('first=1 rows=10');
    store.dispatch(
      entitiesLoadingActions.success(results, filter, loadedFilter, counts),
    );

    const {baseElement} = render(
      <ResultsTab
        audit={false}
        isLoading={true}
        progress={100}
        reload={reload}
        reportFilter={filter}
        reportId={'123'}
        results={results}
        resultsFilter={filter}
        status={'Stopped'}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    await wait();

    const header = baseElement.querySelectorAll('th');
    const row = baseElement.querySelectorAll('tr');

    expect(header[0]).toHaveTextContent('Vulnerability');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('QoD');
    expect(header[4]).toHaveTextContent('Host');
    expect(header[5]).toHaveTextContent('Location');
    expect(header[6]).toHaveTextContent('Created');
    expect(header[7]).toHaveTextContent('IP');
    expect(header[8]).toHaveTextContent('Name');

    expect(row[2]).toHaveTextContent('Result 1');
    expect(row[2]).toHaveTextContent('10.0 (Critical)');
    expect(row[2]).toHaveTextContent('80 %');
    expect(row[2]).toHaveTextContent('123.456.78.910');
    expect(row[2]).toHaveTextContent('foo');
    expect(row[2]).toHaveTextContent('80/tcp');
    expect(row[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    expect(row[3]).toHaveTextContent('Result 2');
    expect(row[3]).toHaveTextContent('5.0 (Medium)');
    expect(row[3]).toHaveTextContent('70 %');
    expect(row[3]).toHaveTextContent('109.876.54.321');
    expect(row[3]).toHaveTextContent('80/tcp');
    expect(row[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    expect(row[4]).toHaveTextContent('Result 3');
    expect(row[4]).toHaveTextContent('5.0 (Medium)');
    expect(row[4]).toHaveTextContent('80 %');
    expect(row[4]).toHaveTextContent('109.876.54.321');
    expect(row[4]).toHaveTextContent('bar');
    expect(row[4]).toHaveTextContent('80/tcp');
    expect(row[4]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');
  });
});
