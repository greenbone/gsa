/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import TaskTrendGroup from 'web/components/powerfilter/tasktrendgroup';
import Filter from 'gmp/models/filter';
import {
  openSelectElement,
  getItemElements,
} from 'web/components/form/__tests__/select';

describe('Task Trend Selector Tests', () => {
  test('should render', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');
    const {element} = render(
      <TaskTrendGroup filter={filter} onChange={onChange} />,
    );

    expect(element).toBeVisible();
  });

  test('should return items', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');
    const {element, baseElement} = render(
      <TaskTrendGroup filter={filter} onChange={onChange} />,
    );

    let domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(0);

    openSelectElement(element);

    domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(5);
    expect(domItems[0]).toHaveTextContent('Severity increased');
    expect(domItems[1]).toHaveTextContent('Severity decreased');
    expect(domItems[2]).toHaveTextContent('Vulnerability count increased');
  });

  test('should parse filter', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=same');
    // eslint-disable-next-line no-shadow
    const {getByTestId} = render(
      <TaskTrendGroup filter={filter} onChange={onChange} />,
    );

    const displayedValue = getByTestId('select-selected-value');
    expect(displayedValue).toHaveTextContent('Vulnerabilities did not change');
  });

  test('should call onChange handler', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');
    const {element, baseElement} = render(
      <TaskTrendGroup filter={filter} onChange={onChange} />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('up', 'trend');
  });
  test('should change value', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    // eslint-disable-next-line no-shadow
    const {baseElement, element, getByTestId} = render(
      <TaskTrendGroup trend="up" filter={filter} onChange={onChange} />,
    );

    const displayedValue = getByTestId('select-selected-value');
    expect(displayedValue).toHaveTextContent('Severity increased');

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[2]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('more', 'trend');
  });
});
