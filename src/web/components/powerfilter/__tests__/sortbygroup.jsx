/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, queryAllByTestId} from 'web/utils/testing';

import SortByGroup from '../sortbygroup';

import Filter from 'gmp/models/filter';

describe('SortByGroup tests', () => {
  test('should render', () => {
    const filter = Filter.fromString('sort');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {element} = render(
      <SortByGroup
        by=""
        fields={[{name: 'foo', displayName: 'bar'}]}
        filter={filter}
        order="sort"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    expect(element).toMatchSnapshot();
  });

  test('should render fields', () => {
    const filter1 = Filter.fromString('sort=severity');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {baseElement, getByTestId} = render(
      <SortByGroup
        by="solution"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter1}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const selectButton = getByTestId('select-open-button');
    fireEvent.click(selectButton);

    const selectElements = queryAllByTestId(baseElement, 'select-item');
    expect(selectElements.length).toEqual(2);

    expect(selectElements[0]).toHaveTextContent('Severity');
    expect(selectElements[1]).toHaveTextContent('Solution Type');
  });

  test('should use filter by default', () => {
    const filter1 = Filter.fromString('sort=severity');
    const filter2 = Filter.fromString('sort-reverse=severity');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {rerender, getAllByTestId, getByTestId} = render(
      <SortByGroup
        by="solution"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter1}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const radio = getAllByTestId('radio-input');

    expect(radio[0].checked).toEqual(true);
    expect(radio[1].checked).toEqual(false);

    const selectedValue = getByTestId('select-selected-value');

    expect(selectedValue).toHaveTextContent('Severity');

    rerender(
      <SortByGroup
        by="solution"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter2}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);

    expect(selectedValue).toHaveTextContent('Severity');
  });

  test('should use by and order', () => {
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {getAllByTestId, getByTestId} = render(
      <SortByGroup
        by="solution_type"
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        order="sort-reverse"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const radio = getAllByTestId('radio-input');

    expect(radio[0].checked).toEqual(false);
    expect(radio[1].checked).toEqual(true);

    const selectedValue = getByTestId('select-selected-value');

    expect(selectedValue).toHaveTextContent('Solution Type');
  });

  test('should call change handler of select', () => {
    const filter = Filter.fromString('sort');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {baseElement, getByTestId} = render(
      <SortByGroup
        by=""
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter}
        order="sort"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const selectButton = getByTestId('select-open-button');
    fireEvent.click(selectButton);

    const selectElements = queryAllByTestId(baseElement, 'select-item');
    expect(selectElements.length).toEqual(2);

    fireEvent.click(selectElements[1]);

    expect(handleSortByChange).toHaveBeenCalledWith('solution_type', 'sort_by');
  });

  test('should call change handler of radio button', () => {
    const filter = Filter.fromString('sort');
    const handleSortByChange = testing.fn();
    const handleSortOrderChange = testing.fn();
    const {getAllByTestId} = render(
      <SortByGroup
        by=""
        fields={[
          {name: 'severity', displayName: 'Severity'},
          {name: 'solution_type', displayName: 'Solution Type'},
        ]}
        filter={filter}
        order="sort"
        onSortByChange={handleSortByChange}
        onSortOrderChange={handleSortOrderChange}
      />,
    );

    const radio = getAllByTestId('radio-input');
    fireEvent.click(radio[1]);

    expect(handleSortOrderChange).toHaveBeenCalledWith(
      'sort-reverse',
      'sort_order',
    );
  });
});
