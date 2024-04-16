/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen, userEvent} from 'web/utils/testing';

import MultiSelect from '../multiselect';

const openSelectElement = async select => {
  select = select || getSelectElement();
  await userEvent.click(select);
};

const getItemElements = () => {
  return screen.queryAllByRole('option');
};

const getSelectElement = () => {
  const select = screen.queryByRole('searchbox');
  if (select) {
    return select;
  }
  return screen.getByRole('textbox');
};

const getSelectedItems = element => {
  return element.querySelectorAll('.mantine-MultiSelect-value');
};

describe('MultiSelect tests', () => {
  test('should render', () => {
    const {element} = render(<MultiSelect />);

    expect(element).toBeVisible();
  });

  test('should render with items', async () => {
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

    render(<MultiSelect items={items} />);

    expect(getItemElements().length).toEqual(0);

    await openSelectElement();

    const domItems = getItemElements();
    expect(domItems.length).toEqual(2);
    expect(domItems[0]).toHaveTextContent('Bar');
    expect(domItems[1]).toHaveTextContent('Foo');
  });

  test('should render loading', async () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    render(<MultiSelect items={items} isLoading={true} />);

    const element = getSelectElement();

    expect(element).toHaveAttribute('placeholder', 'Loading...');

    expect(getItemElements().length).toEqual(0);

    await openSelectElement(element);

    expect(getItemElements().length).toEqual(0);
  });

  test('should render error', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    render(<MultiSelect errorContent={'Some Error'} items={items} />);

    getSelectElement();

    expect(screen.getByText('Some Error')).toBeVisible();
  });

  test('should call onChange handler', async () => {
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

    render(<MultiSelect items={items} onChange={onChange} />);

    await openSelectElement();

    const domItems = getItemElements();
    expect(domItems.length).toEqual(2);

    await userEvent.click(domItems[1]);

    expect(onChange).toHaveBeenCalledWith(['foo'], undefined);
  });

  test('should call onChange handler with name', async () => {
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

    render(<MultiSelect name="abc" items={items} onChange={onChange} />);

    await openSelectElement();

    const domItems = getItemElements();
    expect(domItems.length).toEqual(2);

    await userEvent.click(domItems[0]);

    expect(onChange).toHaveBeenCalledWith(['bar'], 'abc');
  });

  test('should change displayed values', async () => {
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

    const {element, rerender} = render(
      <MultiSelect items={items} value={['bar']} />,
    );

    let displayedItems = getSelectedItems(element);
    expect(displayedItems.length).toEqual(1);
    expect(displayedItems[0]).toHaveTextContent('Bar');

    rerender(<MultiSelect items={items} value={['foo']} />);

    displayedItems = getSelectedItems(element);
    expect(displayedItems.length).toEqual(1);
    expect(displayedItems[0]).toHaveTextContent('Foo');

    rerender(<MultiSelect items={items} value={['foo', 'bar']} />);

    displayedItems = getSelectedItems(element);
    expect(displayedItems.length).toEqual(2);
    expect(displayedItems[0]).toHaveTextContent('Foo');
    expect(displayedItems[1]).toHaveTextContent('Bar');
  });

  test('should filter items', async () => {
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

    render(<MultiSelect items={items} value={[]} />);

    const input = getSelectElement();

    await openSelectElement(input);
    expect(getItemElements().length).toEqual(3);

    fireEvent.change(input, {target: {value: 'ba'}});
    expect(getItemElements().length).toEqual(2);

    fireEvent.change(input, {target: {value: 'F'}});
    expect(getItemElements().length).toEqual(1);
  });

  test('should call onChange handler to remove selected item', async () => {
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

    const {element} = render(
      <MultiSelect items={items} value={['bar', 'foo']} onChange={onChange} />,
    );

    const selectedItems = getSelectedItems(element);
    expect(selectedItems.length).toEqual(2);

    const deleteIcon = selectedItems[0].querySelector('button');
    await userEvent.click(deleteIcon);

    expect(onChange).toHaveBeenCalledWith(['foo'], undefined);
  });
});
