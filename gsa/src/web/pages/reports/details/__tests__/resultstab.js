/* Copyright (C) 2021 Greenbone Networks GmbH
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

import CollectionCounts from 'gmp/collection/collectioncounts';

import {setLocale} from 'gmp/locale/lang';

import Filter from 'gmp/models/filter';
import Result from 'gmp/models/result';

import {entitiesLoadingActions} from 'web/store/entities/results';
import {setTimezone, setUsername} from 'web/store/usersettings/actions';

import {rendererWith, wait} from 'web/utils/testing';

import {
  result1,
  result2,
  result3,
} from 'web/pages/reports/__mocks__/mockreport';
import ResultsTab from '../resultstab';

// setup

setLocale('en');

const reportFilter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity',
);

const resultsFilter = Filter.fromString(
  'apply_overrides=0 levels=hml rows=100 min_qod=70 first=1 sort-reverse=severity _and_report_id=1234',
);

const sorting = {
  results: {
    sortField: 'severity',
    sortReverse: true,
  },
};

// mock entity
const resultA = Result.fromElement(result1);
const resultB = Result.fromElement(result2);
const resultC = Result.fromElement(result3);

const results = [resultA, resultB, resultC];

// mock gmp commands
let getResults;

beforeEach(() => {
  getResults = jest.fn().mockResolvedValue({
    data: results,
    meta: {
      filter: Filter.fromString(),
      counts: new CollectionCounts(),
    },
  });
});

describe('Report Results Tab tests', () => {
  test('should render Report Results Tab', async () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onInteraction = jest.fn();
    const onSortChange = jest.fn();
    const onTargetEditClick = jest.fn();

    const gmp = {
      results: {
        get: getResults,
      },
      settings: {},
    };

    const {render, store} = rendererWith({
      gmp,
      capabilities: true,
      router: true,
      store: true,
    });

    store.dispatch(setTimezone('CET'));
    store.dispatch(setUsername('admin'));

    const counts = new CollectionCounts({
      first: 1,
      all: 1,
      filtered: 1,
      length: 1,
      rows: 10,
    });
    store.dispatch(
      entitiesLoadingActions.success(
        results,
        resultsFilter,
        resultsFilter,
        counts,
      ),
    );

    const {baseElement} = render(
      <ResultsTab
        status={'Done'}
        progress={100}
        hasTarget={true}
        reportFilter={reportFilter}
        reportId={'1234'}
        sortField={sorting.results.sortField}
        sortReverse={sorting.results.sortReverse}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onInteraction={onInteraction}
        onSortChange={sortField => onSortChange('results', sortField)}
        onTargetEditClick={onTargetEditClick}
      />,
    );

    await wait();

    const header = baseElement.querySelectorAll('th');
    const rows = baseElement.querySelectorAll('tr');

    // Headings
    expect(header[0]).toHaveTextContent('Vulnerability');
    expect(header[1]).toHaveTextContent('solution_type.svg');
    expect(header[2]).toHaveTextContent('Severity');
    expect(header[3]).toHaveTextContent('QoD');
    expect(header[4]).toHaveTextContent('Host');
    expect(header[5]).toHaveTextContent('Location');
    expect(header[6]).toHaveTextContent('Created');
    expect(header[7]).toHaveTextContent('IP');
    expect(header[8]).toHaveTextContent('Name');

    // Row 1
    expect(rows[2]).toHaveTextContent('Result 1');
    expect(rows[2]).toHaveTextContent('10.0 (High)');
    expect(rows[2]).toHaveTextContent('80 %');
    expect(rows[2]).toHaveTextContent('123.456.78.910');
    expect(rows[2]).toHaveTextContent('80/tcp');
    expect(rows[2]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 2
    expect(rows[3]).toHaveTextContent('Result 2');
    expect(rows[3]).toHaveTextContent('5.0 (Medium)');
    expect(rows[3]).toHaveTextContent('70 %');
    expect(rows[3]).toHaveTextContent('109.876.54.321');
    expect(rows[3]).toHaveTextContent('80/tcp');
    expect(rows[3]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Row 3
    expect(rows[4]).toHaveTextContent('Result 3');
    expect(rows[4]).toHaveTextContent('st_mitigate.svg');
    expect(rows[4]).toHaveTextContent('5.0 (Medium)');
    expect(rows[4]).toHaveTextContent('80 %');
    expect(rows[4]).toHaveTextContent('109.876.54.321');
    expect(rows[4]).toHaveTextContent('80/tcp');
    expect(rows[4]).toHaveTextContent('Mon, Jun 3, 2019 1:06 PM CEST');

    // Filter
    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hml rows=2 min_qod=70 first=1 sort-reverse=severity)',
    );
  });
});
