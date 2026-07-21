/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, fireEvent, screen} from 'web/testing';
import BaseFilter from 'gmp/models/filter/base-filter';
import ThresholdPanel from 'web/pages/reports/details/ReportThresholdPanel';

describe('ReportThresholdPanel tests', () => {
  test('should render threshold panel', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

    const filter = BaseFilter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    );

    render(
      <ThresholdPanel
        entityType="Hosts"
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    // Should include
    expect(
      screen.getByText(
        /The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Please decrease the number of results below the threshold of 10 by applying a more refined filter\./,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Results aren't filtered by severity."),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Apply a minimum severity of 7.0.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Your filter settings may be too unrefined.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Adjust and update your filter settings.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('(Applied filter: apply_overrides=0)'),
    ).toBeInTheDocument();

    // Should not include
    expect(
      screen.queryByText('Result with log messages are currently included.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Results with low severity are currently included.'),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Results with medium severity are currently included.',
      ),
    ).not.toBeInTheDocument();
  });

  test('should render threshold panel with different severities included', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

    const filter = BaseFilter.fromString(
      'apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    render(
      <ThresholdPanel
        entityType="Hosts"
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    expect(
      screen.getByText(
        /The Hosts cannot be displayed in order to maintain the performance within the browser's capabilities\./,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Please decrease the number of results below the threshold of 10 by applying a more refined filter\./,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Results with log messages are currently included.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Filter out log message results.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Results with the severity "Low" are currently included.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Filter out results with the severity "Low".'),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        'Results with the severity "Medium" are currently included.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Filter out results with the severity "Medium".'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('Your filter settings may be too unrefined.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Adjust and update your filter settings.'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('(Applied filter: apply_overrides=0 levels=hmlg)'),
    ).toBeInTheDocument();
  });

  test('should call click handler', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

    const filter = BaseFilter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    );

    const filterMinSeverity = BaseFilter.fromString(
      'apply_overrides=0 rows=2 first=1 sort-reverse=severity',
    ).set('severity', 7.0, '>');

    render(
      <ThresholdPanel
        entityType="Hosts"
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    const filterIcons = screen.getAllByRole('button', {name: 'Filter Icon'});
    const editIcon = screen.getByRole('button', {name: 'Edit Icon'});

    fireEvent.click(filterIcons[0]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterMinSeverity);

    fireEvent.click(editIcon);
    expect(onFilterEditClick).toHaveBeenCalled();
  });

  test('should call click handler for different severity levels', () => {
    const onFilterEditClick = testing.fn();
    const onFilterChanged = testing.fn();

    const filter = BaseFilter.fromString(
      'apply_overrides=0 levels=hmlg rows=2 first=1 sort-reverse=severity',
    );

    const filterLog = BaseFilter.fromString(
      'apply_overrides=0 levels=hml rows=2 first=1 sort-reverse=severity',
    );

    const filterLow = BaseFilter.fromString(
      'apply_overrides=0 levels=hmg rows=2 first=1 sort-reverse=severity',
    );

    const filterMedium = BaseFilter.fromString(
      'apply_overrides=0 levels=hlg rows=2 first=1 sort-reverse=severity',
    );

    render(
      <ThresholdPanel
        entityType={'Hosts'}
        filter={filter}
        isUpdating={false}
        threshold={10}
        onFilterChanged={onFilterChanged}
        onFilterEditClick={onFilterEditClick}
      />,
    );

    const filterIcons = screen.getAllByRole('button', {name: 'Filter Icon'});

    fireEvent.click(filterIcons[0]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterLog);

    fireEvent.click(filterIcons[1]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterLow);

    fireEvent.click(filterIcons[2]);
    expect(onFilterChanged).toHaveBeenCalledWith(filterMedium);
  });
});
