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

import {render, fireEvent} from 'web/utils/testing';

import EmptyResultsReport from '../emptyresultsreport';

setLocale('en');

describe('Empty Results Report tests', () => {
  test('should render empty results report', () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <EmptyResultsReport
        all={100}
        filter={filter}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    // Should include
    expect(baseElement).toHaveTextContent(
      'The report is empty. The filter does not match any of the 100 results.',
    );
    expect(baseElement).toHaveTextContent(
      'The following filter is currently applied: apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(icons[0]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
    expect(icons[1]).toHaveTextContent('delete.svg');
    expect(baseElement).toHaveTextContent('Remove all filter settings.');

    // Should not include
    expect(baseElement).not.toHaveTextContent(
      'Log messages are currently excluded.',
    );
    expect(baseElement).not.toHaveTextContent(
      'You are using keywords setting a minimum limit on severity.',
    );
    expect(baseElement).not.toHaveTextContent(
      'There may be results below the currently selected Quality of Detection (QoD).',
    );
  });

  test('should render empty results report with log messages filter', () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hml rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <EmptyResultsReport
        all={100}
        filter={filter}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    // Should include
    expect(baseElement).toHaveTextContent(
      'The report is empty. The filter does not match any of the 100 results.',
    );
    expect(baseElement).toHaveTextContent(
      'The following filter is currently applied: apply_overrides=0 levels=hml rows=2 first=1 sort-reverse=severity',
    );

    expect(baseElement).toHaveTextContent(
      'Log messages are currently excluded.',
    );
    expect(icons[0]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Include log messages in your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(icons[1]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
    expect(icons[2]).toHaveTextContent('delete.svg');
    expect(baseElement).toHaveTextContent('Remove all filter settings.');

    // Should not include
    expect(baseElement).not.toHaveTextContent(
      'You are using keywords setting a minimum limit on severity.',
    );
    expect(baseElement).not.toHaveTextContent(
      'There may be results below the currently selected Quality of Detection (QoD).',
    );
  });

  test('should render empty results report with severity filter', () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg severity>50 rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <EmptyResultsReport
        all={100}
        filter={filter}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    // Should include
    expect(baseElement).toHaveTextContent(
      'The report is empty. The filter does not match any of the 100 results.',
    );
    expect(baseElement).toHaveTextContent(
      'The following filter is currently applied: apply_overrides=0 levels=hmlg severity>50 rows=2 first=1 sort-reverse=severity',
    );

    expect(baseElement).toHaveTextContent(
      'You are using keywords setting a minimum limit on severity.',
    );
    expect(icons[0]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Remove the severity limit from your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(icons[1]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
    expect(icons[2]).toHaveTextContent('delete.svg');
    expect(baseElement).toHaveTextContent('Remove all filter settings.');

    // Should not include
    expect(baseElement).not.toHaveTextContent(
      'Log messages are currently excluded.',
    );
    expect(baseElement).not.toHaveTextContent(
      'There may be results below the currently selected Quality of Detection (QoD).',
    );
  });

  test('should render empty results report with min qod filter', () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg min_qod>70 rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <EmptyResultsReport
        all={100}
        filter={filter}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    // Should include
    expect(baseElement).toHaveTextContent(
      'The report is empty. The filter does not match any of the 100 results.',
    );
    expect(baseElement).toHaveTextContent(
      'The following filter is currently applied: apply_overrides=0 levels=hmlg min_qod>70 rows=2 first=1 sort-reverse=severity',
    );

    expect(baseElement).toHaveTextContent(
      'There may be results below the currently selected Quality of Detection (QoD).',
    );
    expect(icons[0]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Decrease the minimum QoD in the filter settings to 30 percent to see those results.',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(icons[1]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
    expect(icons[2]).toHaveTextContent('delete.svg');
    expect(baseElement).toHaveTextContent('Remove all filter settings.');

    // Should not include
    expect(baseElement).not.toHaveTextContent(
      'Log messages are currently excluded.',
    );
    expect(baseElement).not.toHaveTextContent(
      'You are using keywords setting a minimum limit on severity.',
    );
  });
  test('should call click handlers', () => {
    const onFilterAddLogLevelClick = jest.fn();
    const onFilterDecreaseMinQoDClick = jest.fn();
    const onFilterEditClick = jest.fn();
    const onFilterRemoveClick = jest.fn();
    const onFilterRemoveSeverityClick = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hml rows=2 severity>50 min_qod=70 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <EmptyResultsReport
        all={100}
        filter={filter}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(icons[0]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[0]);
    expect(onFilterAddLogLevelClick).toHaveBeenCalled();

    expect(icons[1]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[1]);
    expect(onFilterRemoveSeverityClick).toHaveBeenCalled();

    expect(icons[2]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[2]);
    expect(onFilterDecreaseMinQoDClick).toHaveBeenCalled();

    expect(icons[3]).toHaveTextContent('edit.svg');
    fireEvent.click(icons[3]);
    expect(onFilterEditClick).toHaveBeenCalled();

    expect(icons[4]).toHaveTextContent('delete.svg');
    fireEvent.click(icons[4]);
    expect(onFilterRemoveClick).toHaveBeenCalled();
  });
});
