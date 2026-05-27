/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {act, rendererWith} from 'web/testing';
import {screen} from '@testing-library/react';
import CollectionCounts from 'gmp/collection/collection-counts';
import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';
import {createSession} from 'gmp/testing';
import {SEVERITY_RATING_CVSS_3} from 'gmp/utils/severity';
import ResultsTab from 'web/pages/reports/details/result/ResultsTab';
import {defaultFilterLoadingActions} from 'web/store/usersettings/defaultfilters/actions';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const reloadInterval = 60000;
const reloadIntervalActive = 100; // short value for timer tests
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

const createGmp = ({
  getResults = testing.fn().mockResolvedValue({
    data: results,
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getAggregates = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getDashboardSetting = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  getFilters = testing.fn().mockResolvedValue({
    data: [],
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  }),
  currentSettings = testing.fn().mockResolvedValue({
    foo: 'bar',
  }),
}) => ({
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
  settings: {
    manualUrl,
    reloadInterval,
    reloadIntervalActive,
    severityRating: SEVERITY_RATING_CVSS_3,
  },
  session: createSession({token: 'test-token', timezone: 'CET'}),
  user: {currentSettings},
});

describe('Report Results Tab tests', () => {
  test.each([
    ['compliance information', true, 'Compliant', 'Yes', 'No', 'Incomplete'],
    [
      'severity information',
      false,
      'Severity',
      '10.0 (Critical)',
      '5.0 (Medium)',
      '5.0 (Medium)',
    ],
  ])(
    'should render Results Tab with %s',
    async (_, audit, header2Text, row2Val, row3Val, row4Val) => {
      const onFilterAddLogLevelClick = testing.fn();
      const onFilterDecreaseMinQoDClick = testing.fn();
      const onFilterEditClick = testing.fn();
      const onFilterRemoveClick = testing.fn();
      const onFilterRemoveSeverityClick = testing.fn();
      const onTargetEditClick = testing.fn();

      const getResults = testing.fn().mockResolvedValue({
        data: results,
        meta: {
          filter: Filter.fromString(),
          counts: new CollectionCounts({
            first: 1,
            all: 3,
            filtered: 3,
            length: 3,
            rows: 10,
          }),
        },
      });

      const gmp = createGmp({getResults});

      const {render, store} = rendererWith({
        gmp,
        capabilities: true,
        store: true,
        router: true,
      });

      const defaultSettingFilter = Filter.fromString('foo=bar');
      store.dispatch(loadingActions.success({rowsperpage: {value: '2'}}));
      store.dispatch(
        defaultFilterLoadingActions.success('result', defaultSettingFilter),
      );

      const filter = Filter.fromString('first=1 rows=10');
      const reportResultsCounts = new CollectionCounts({
        first: 1,
        all: 3,
        filtered: 3,
        length: 3,
        rows: 10,
      });

      render(
        <ResultsTab
          audit={audit}
          hasTarget={true}
          progress={100}
          reportFilter={filter}
          reportId={'123'}
          reportResultsCounts={reportResultsCounts}
          status={'Stopped'}
          onFilterAddLogLevelClick={onFilterAddLogLevelClick}
          onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
          onFilterEditClick={onFilterEditClick}
          onFilterRemoveClick={onFilterRemoveClick}
          onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
          onTargetEditClick={onTargetEditClick}
        />,
      );

      await screen.findByTestId('entities-table');

      const headers = screen.getAllByRole('columnheader');
      const rows = screen.getAllByRole('row');

      expect(headers[0]).toHaveTextContent('Vulnerability');
      expect(headers[2]).toHaveTextContent(header2Text);
      expect(headers[3]).toHaveTextContent('QoD');
      expect(headers[4]).toHaveTextContent('Host');
      expect(headers[5]).toHaveTextContent('Location');
      expect(headers[6]).toHaveTextContent('Created');
      expect(headers[7]).toHaveTextContent('IP');
      expect(headers[8]).toHaveTextContent('Name');

      expect(rows[2]).toHaveTextContent('Result 1');
      expect(rows[2]).toHaveTextContent(row2Val);
      expect(rows[2]).toHaveTextContent('80 %');
      expect(rows[2]).toHaveTextContent('123.456.78.910');
      expect(rows[2]).toHaveTextContent('foo');
      expect(rows[2]).toHaveTextContent('80/tcp');
      expect(rows[2]).toHaveTextContent(
        'Mon, Jun 3, 2019 1:06 PM Central European Summer Time',
      );

      expect(rows[3]).toHaveTextContent('Result 2');
      expect(rows[3]).toHaveTextContent(row3Val);
      expect(rows[3]).toHaveTextContent('70 %');
      expect(rows[3]).toHaveTextContent('109.876.54.321');
      expect(rows[3]).toHaveTextContent('80/tcp');
      expect(rows[3]).toHaveTextContent(
        'Mon, Jun 3, 2019 1:06 PM Central European Summer Time',
      );

      expect(rows[4]).toHaveTextContent('Result 3');
      expect(rows[4]).toHaveTextContent(row4Val);
      expect(rows[4]).toHaveTextContent('80 %');
      expect(rows[4]).toHaveTextContent('109.876.54.321');
      expect(rows[4]).toHaveTextContent('bar');
      expect(rows[4]).toHaveTextContent('80/tcp');
      expect(rows[4]).toHaveTextContent(
        'Mon, Jun 3, 2019 1:06 PM Central European Summer Time',
      );
    },
  );

  describe('Results polling behavior isActive status', () => {
    test.each([
      [
        'should poll results when task status is active',
        'Running',
        50,
        reloadIntervalActive + 50,
        2,
      ],
      [
        'should not poll results when task status is not active',
        'Stopped',
        100,
        reloadIntervalActive * 10,
        1,
      ],
    ])('%s', async (_, status, progress, timeToAdvance, expectedCallCount) => {
      testing.useFakeTimers();

      const getResults = testing.fn().mockResolvedValue({
        data: results,
        meta: {
          filter: Filter.fromString(),
          counts: new CollectionCounts({
            first: 1,
            all: 3,
            filtered: 3,
            length: 3,
            rows: 10,
          }),
        },
      });

      const gmp = createGmp({getResults});
      const {render, store} = rendererWith({
        gmp,
        capabilities: true,
        store: true,
        router: true,
      });

      store.dispatch(loadingActions.success({rowsperpage: {value: '10'}}));

      render(
        <ResultsTab
          hasTarget={true}
          progress={progress}
          reportFilter={Filter.fromString('first=1 rows=10')}
          reportId={'123'}
          reportResultsCounts={
            new CollectionCounts({first: 1, all: 3, filtered: 3, rows: 10})
          }
          status={status}
          onFilterDecreaseMinQoDClick={testing.fn()}
          onFilterEditClick={testing.fn()}
          onFilterRemoveClick={testing.fn()}
          onTargetEditClick={testing.fn()}
        />,
      );

      await act(async () => {});
      expect(getResults).toHaveBeenCalledTimes(1);

      await act(async () => {
        await testing.advanceTimersByTimeAsync(timeToAdvance);
      });

      expect(getResults).toHaveBeenCalledTimes(expectedCallCount);

      testing.useRealTimers();
    });
  });
});
