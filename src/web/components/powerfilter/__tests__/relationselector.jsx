/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render} from 'web/utils/testing';

import {
  openSelectElement,
  getSelectItemElements,
  clickItem,
  getSelectElement,
  changeSelectInput,
} from 'web/components/testing';

import RelationSelector from 'web/components/powerfilter/relationselector';

describe('Relation Selector Tests', () => {
  test('should render', () => {
    const onChange = testing.fn();
    const {element} = render(
      <RelationSelector relation="<" onChange={onChange} />,
    );

    expect(element).toBeVisible();
  });

  test('should return items', async () => {
    const onChange = testing.fn();
    render(<RelationSelector relation="<" onChange={onChange} />);

    let domItems = getSelectItemElements();
    expect(domItems.length).toEqual(0);

    await openSelectElement();

    domItems = getSelectItemElements();

    expect(domItems.length).toEqual(4);
    expect(domItems[0]).toHaveTextContent('--');
    expect(domItems[1]).toHaveTextContent('is equal to');
    expect(domItems[2]).toHaveTextContent('is greater than');
    expect(domItems[3]).toHaveTextContent('is less than');
  });

  test('should call onChange handler', async () => {
    const onChange = testing.fn();

    render(<RelationSelector relation="<" onChange={onChange} />);

    await openSelectElement();

    const domItems = getSelectItemElements();

    await clickItem(domItems[1]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('=', undefined);
  });

  test('should change value', async () => {
    const onChange = testing.fn();

    render(<RelationSelector relation="=" onChange={onChange} />);

    const displayedValue = getSelectElement();
    expect(displayedValue).toHaveValue('is equal to');

    await openSelectElement();

    const domItems = getSelectItemElements();

    await clickItem(domItems[3]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('<', undefined);
  });

  test('should filter items', async () => {
    const onChange = testing.fn();
    render(<RelationSelector relation="=" onChange={onChange} />);

    await openSelectElement();

    let domItems = getSelectItemElements();
    expect(domItems.length).toEqual(4);

    changeSelectInput('than');

    domItems = getSelectItemElements();
    expect(domItems.length).toEqual(2);

    changeSelectInput('to');

    domItems = getSelectItemElements();
    expect(domItems.length).toEqual(1);
  });
});
