/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Filter from 'gmp/models/filter';
import {render, fireEvent} from 'web/utils/Testing';

import EmptyResultsReport from '../EmptyResultsReport';

describe('Empty Results Report tests', () => {
  test('should render empty results report', () => {
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();

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
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
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
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();

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
    expect(baseElement).toHaveTextContent(
      'Include log messages in your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
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
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();

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
    expect(baseElement).toHaveTextContent(
      'Remove the severity limit from your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
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
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();

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
    expect(baseElement).toHaveTextContent(
      'Decrease the minimum QoD in the filter settings to 30 percent to see those results.',
    );

    expect(baseElement).toHaveTextContent(
      'Your filter settings may be too refined.',
    );
    expect(baseElement).toHaveTextContent(
      'Adjust and update your filter settings.',
    );

    expect(baseElement).toHaveTextContent(
      'Your last filter change may be too restrictive.',
    );
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
    const onFilterAddLogLevelClick = testing.fn();
    const onFilterDecreaseMinQoDClick = testing.fn();
    const onFilterEditClick = testing.fn();
    const onFilterRemoveClick = testing.fn();
    const onFilterRemoveSeverityClick = testing.fn();

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

    fireEvent.click(icons[0]);
    expect(onFilterAddLogLevelClick).toHaveBeenCalled();

    fireEvent.click(icons[1]);
    expect(onFilterRemoveSeverityClick).toHaveBeenCalled();

    fireEvent.click(icons[2]);
    expect(onFilterDecreaseMinQoDClick).toHaveBeenCalled();

    fireEvent.click(icons[3]);
    expect(onFilterEditClick).toHaveBeenCalled();

    fireEvent.click(icons[4]);
    expect(onFilterRemoveClick).toHaveBeenCalled();
  });
});
