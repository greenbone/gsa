/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent} from 'web/utils/testing';

import {
  openSelectElement,
  getItemElements,
  getInputBox,
} from 'web/components/form/__tests__/select';

import RelationSelector from 'web/components/powerfilter/relationselector';

describe('Relation Selector Tests', () => {
  test('should render', () => {
    const onChange = testing.fn();
    const {element} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    expect(element).toBeVisible();
  });

  test('should return items', () => {
    const onChange = testing.fn();
    const {element, baseElement} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    let domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(0);

    openSelectElement(element);

    domItems = getItemElements(baseElement);

    expect(domItems.length).toEqual(4);
    expect(domItems[0]).toHaveTextContent('--');
    expect(domItems[1]).toHaveTextContent('is equal to');
    expect(domItems[2]).toHaveTextContent('is greater than');
    expect(domItems[3]).toHaveTextContent('is less than');
  });

  test('should call onChange handler', () => {
    const onChange = testing.fn();

    const {element, baseElement} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[1]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('=', undefined);
  });
  test('should change value', () => {
    const onChange = testing.fn();

    // eslint-disable-next-line no-shadow
    const {baseElement, element, getByTestId} = render(
      <RelationSelector relation="=" onChange={onChange} />,
    );

    const displayedValue = getByTestId('select-selected-value');
    expect(displayedValue).toHaveTextContent('is equal to');

    openSelectElement(element);

    const domItems = getItemElements(baseElement);

    fireEvent.click(domItems[3]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('<', undefined);
  });

  test('should filter items', () => {
    const onChange = testing.fn();
    const {element, baseElement} = render(
      <RelationSelector relation="=" onChange={onChange} />,
    );
    openSelectElement(element);

    let domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(4);

    const input = getInputBox(baseElement);

    fireEvent.change(input, {target: {value: 'than'}});

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(2);

    fireEvent.change(input, {target: {value: 'to'}});

    domItems = getItemElements(baseElement);
    expect(domItems.length).toEqual(1);
  });
});
