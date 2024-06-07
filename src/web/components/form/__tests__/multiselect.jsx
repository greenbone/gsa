/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import MultiSelect from '../multiselect';

const openInputElement = element => {
  const button = element.querySelector('[type="button"]');
  fireEvent.click(button);
};

const getItemElements = baseElement => {
  const portal = baseElement.querySelector('#portals');
  return portal.querySelectorAll('span');
};

describe('MultiSelect component tests', () => {
  test('should render', () => {
    const {element} = render(<MultiSelect />);

    expect(element).toMatchSnapshot();
  });

  test('should render with items', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const {element, baseElement} = render(<MultiSelect items={items} />);

    let domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(0);

    openInputElement(element);

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(2);
    expect(domItems[0]).toHaveTextContent('Bar');
    expect(domItems[1]).toHaveTextContent('Foo');
  });

  test('should render loading', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    const {element, baseElement} = render(
      <MultiSelect items={items} isLoading={true} />,
    );

    expect(element).toHaveTextContent('Loading...');

    let domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(0);

    openInputElement(element);

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(0);
  });

  test('should render invalid state', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    const {element} = render(<MultiSelect hsaError={true} items={items} />);

    expect(element).toHaveTextContent('×');
    expect(element).toHaveStyleRule('background-color: #f2dede');
  });

  test('should call onChange handler', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const onChange = testing.fn();

    const {element, baseElement} = render(
      <MultiSelect items={items} onChange={onChange} />,
    );

    openInputElement(element);

    const domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(2);

    fireEvent.click(domItems[1]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(['foo'], undefined);
  });

  test('should call onChange handler with name', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const onChange = testing.fn();

    const {element, baseElement} = render(
      <MultiSelect name="abc" items={items} onChange={onChange} />,
    );

    openInputElement(element);

    const domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(2);

    fireEvent.click(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith(['bar'], 'abc');
  });

  test('should change displayed values', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const {rerender, getAllByTestId} = render(
      <MultiSelect items={items} value={['bar']} />,
    );

    let displayedItems = getAllByTestId('multiselect-selected-label');
    expect(displayedItems.length).toEqual(1);
    expect(displayedItems[0]).toHaveTextContent('Bar');

    rerender(<MultiSelect items={items} value={['foo']} />);

    displayedItems = getAllByTestId('multiselect-selected-label');
    expect(displayedItems.length).toEqual(1);
    expect(displayedItems[0]).toHaveTextContent('Foo');

    rerender(<MultiSelect items={items} value={['foo', 'bar']} />);

    displayedItems = getAllByTestId('multiselect-selected-label');
    expect(displayedItems.length).toEqual(2);
    expect(displayedItems[0]).toHaveTextContent('Foo');
    expect(displayedItems[1]).toHaveTextContent('Bar');
  });

  test('should filter items', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'bat',
        label: 'Bat',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const {element, getByTestId, getAllByTestId} = render(
      <MultiSelect items={items} value={[]} />,
    );

    openInputElement(element);

    let domItems = getAllByTestId('multiselect-item-label');
    expect(domItems.length).toEqual(3);

    const input = getByTestId('multiselect-input');

    fireEvent.change(input, {target: {value: 'ba'}});
    domItems = getAllByTestId('multiselect-item-label');
    expect(domItems.length).toEqual(2);

    fireEvent.change(input, {target: {value: 'F'}});
    domItems = getAllByTestId('multiselect-item-label');
    expect(domItems.length).toEqual(1);
  });

  test('should call onChange handler to remove selected item', () => {
    const items = [
      {
        value: 'bar',
        label: 'Bar',
      },
      {
        value: 'foo',
        label: 'Foo',
      },
    ];

    const onChange = testing.fn();

    const {getAllByTestId} = render(
      <MultiSelect items={items} value={['bar', 'foo']} onChange={onChange} />,
    );

    const selectedItems = getAllByTestId('multiselect-selected-label');
    expect(selectedItems.length).toEqual(2);

    const deleteIcons = getAllByTestId('multiselect-selected-delete');
    expect(deleteIcons.length).toEqual(2);
    fireEvent.click(deleteIcons[0]);

    expect(onChange).toHaveBeenCalledWith(['foo'], undefined);
  });
});

// vim: set ts=2 sw=2 tw=80:
