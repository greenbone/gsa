/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent} from 'web/testing';
import Filter from 'gmp/models/filter';
import Thresholdpanel from 'web/pages/reports/details/ThresholdPanel';

describe('Report Threshold Panel tests', () => {
  test('should render threshold panel', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <Thresholdpanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

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
    expect(baseElement).toHaveTextContent('Apply a minimum severity of 7.0.');

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too unrefined.',
    );
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
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

    const filter = Filter.fromString(
      'apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    const {baseElement} = render(
      <Thresholdpanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    expect(baseElement).toHaveTextContent(
      "The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities.",
    );
    expect(baseElement).toHaveTextContent(
      'Please decrease the number of results below the threshold of 10 by applying a more refined filter.',
    );

    expect(baseElement).toHaveTextContent(
      'Results with log messages are currently included.',
    );
    expect(baseElement).toHaveTextContent('Filter out log message results.');

    expect(baseElement).toHaveTextContent(
      'Results with the severity "Low" are currently included.',
    );
    expect(baseElement).toHaveTextContent(
      'Filter out results with the severity "Low".',
    );

    expect(baseElement).toHaveTextContent(
      'Results with the severity "Medium" are currently included.',
    );
    expect(baseElement).toHaveTextContent(
      'Filter out results with the severity "Medium".',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too unrefined.',
    );
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      '(Applied filter: apply_overrides=0 levels=hmlg)',
    );
  });

  test('should call click handler', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

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
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    fireEvent.click(icons[0]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterMinSeverity);

    fireEvent.click(icons[1]);
    expect(onFilterEditClick).toHaveBeenCalled();
  });

  test('should call click handler for different severity levels', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

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
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    const icons = baseElement.querySelectorAll('svg');

    fireEvent.click(icons[0]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterLog);

    fireEvent.click(icons[1]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterLow);

    fireEvent.click(icons[2]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterMedium);
  });
});
