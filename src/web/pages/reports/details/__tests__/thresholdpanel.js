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

import Thresholdpanel from '../thresholdpanel';

setLocale('en');

describe('Report Threshold Panel tests', () => {
  test('should render threshold panel', () => {
    const onFilterEditClick = jest.fn();
    const onFilterChanged = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <Thresholdpanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterEditClick={onFilterEditClick}
        onFilterChanged={onFilterChanged}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    // Should include
    expect(baseElement).toHaveTextContent(
      "The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities.",
    );
    expect(baseElement).toHaveTextContent(
      'Please decrease the number of results below the threshold of 10 by applying a more refined filter.',
    );

    expect(baseElement).toHaveTextContent(
      "Results aren't filtered by severity.",
    );
    expect(icons[0]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent('Apply a minimum severity of 7.0.');

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too unrefined.',
    );
    expect(icons[1]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0)',
    );

    // Should not include
    expect(baseElement).not.toHaveTextContent(
      'Result with log messages are currently included.',
    );
    expect(baseElement).not.toHaveTextContent(
      'Results with low severity are currently included.',
    );
    expect(baseElement).not.toHaveTextContent(
      'Results with medium severity are currently included.',
    );
  });

  test('should render threshold panel with different severities included', () => {
    const onFilterEditClick = jest.fn();
    const onFilterChanged = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <Thresholdpanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterEditClick={onFilterEditClick}
        onFilterChanged={onFilterChanged}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(baseElement).toHaveTextContent(
      "The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities.",
    );
    expect(baseElement).toHaveTextContent(
      'Please decrease the number of results below the threshold of 10 by applying a more refined filter.',
    );

    expect(baseElement).toHaveTextContent(
      'Results with log messages are currently included.',
    );
    expect(icons[0]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent('Filter out log message results.');

    expect(baseElement).toHaveTextContent(
      'Results with the severity "Low" are currently included.',
    );
    expect(icons[1]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Filter out results with the severity "Low".',
    );

    expect(baseElement).toHaveTextContent(
      'Results with the severity "Medium" are currently included.',
    );
    expect(icons[2]).toHaveTextContent('filter.svg');
    expect(baseElement).toHaveTextContent(
      'Filter out results with the severity "Medium".',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too unrefined.',
    );
    expect(icons[3]).toHaveTextContent('edit.svg');
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hmlg)',
    );
  });

  test('should call click handler', () => {
    const onFilterEditClick = jest.fn();
    const onFilterChanged = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    );

    const filterMinSeverity = Filter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    );

    filterMinSeverity.set('severity', 7.0, '>');

    const {baseElement} = render(
      <Thresholdpanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterEditClick={onFilterEditClick}
        onFilterChanged={onFilterChanged}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(icons[0]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[0]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterMinSeverity);

    expect(icons[1]).toHaveTextContent('edit.svg');
    fireEvent.click(icons[1]);
    expect(onFilterEditClick).toHaveBeenCalled();
  });

  test('should call click handler for different severity levels', () => {
    const onFilterEditClick = jest.fn();
    const onFilterChanged = jest.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    const filterLog = Filter.fromString(
      'apply_overrides=0 levels=hml rows=2 first=1 sort-reverse=severity',
    );

    const filterLow = Filter.fromString(
      'apply_overrides=0 levels=hmg rows=2 first=1 sort-reverse=severity',
    );

    const filterMedium = Filter.fromString(
      'apply_overrides=0 levels=hlg rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <Thresholdpanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterEditClick={onFilterEditClick}
        onFilterChanged={onFilterChanged}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    expect(icons[0]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[0]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterLog);

    expect(icons[1]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[1]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterLow);

    expect(icons[2]).toHaveTextContent('filter.svg');
    fireEvent.click(icons[2]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterMedium);
  });
});
