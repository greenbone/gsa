/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, within, fireEvent, render, userEvent} from 'web/testing';
import MultiSelect from 'web/components/form/MultiSelect';

describe('MultiSelect tests', () => {
  test('should render', () => {
    render(<MultiSelect />);

    const multiSelect = screen.getMultiSelectElement();
    expect(multiSelect).toBeVisible();
  });

  test('should render with items', async () => {
    const items = [
      {value: 'bar', label: 'Bar'},
      {value: 'foo', label: 'Foo'},
    ];

    render(<MultiSelect items={items} />);

    expect(screen.queryAllByRole('option').length).toEqual(0);

    const multiSelect = screen.getMultiSelectElement();
    fireEvent.click(multiSelect);

    const options = screen.getSelectItemElementsForMultiSelect();
    expect(options.length).toEqual(2);
    expect(options[0]).toHaveTextContent('Bar');
    expect(options[1]).toHaveTextContent('Foo');
  });

  test('should render loading', async () => {
    const items = [{value: '0', label: '--'}];

    render(<MultiSelect isLoading={true} items={items} />);

    const element = screen.getByPlaceholderText('Loading...');
    expect(screen.queryAllByRole('option').length).toEqual(0);

    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('readonly');
  });

  test('should render error', () => {
    const items = [{value: '0', label: '--'}];

    render(<MultiSelect errorContent={'Some Error'} items={items} />);

    expect(screen.getByText('Some Error')).toBeVisible();
  });

  test('should call onChange handler', async () => {
    const items = [
      {value: 'bar', label: 'Bar'},
      {value: 'foo', label: 'Foo'},
    ];

    const onChange = testing.fn();

    render(<MultiSelect items={items} onChange={onChange} />);

    const multiSelect = screen.getMultiSelectElement();
    fireEvent.click(multiSelect);

    const options = screen.getSelectItemElementsForMultiSelect();
    expect(options.length).toEqual(2);
    fireEvent.click(options[1]);
    expect(onChange).toHaveBeenCalledWith(['foo'], undefined);
  });

  test('should change displayed values', async () => {
    const items = [
      {value: 'bar', label: 'Bar'},
      {value: 'foo', label: 'Foo'},
    ];

    const {rerender} = render(<MultiSelect data={items} value={['bar']} />);

    let displayedItems = screen.getAllByText('bar');
    expect(displayedItems.length).toEqual(1);
    expect(displayedItems[0]).toHaveTextContent('bar');

    rerender(
      <MultiSelect
        data={[
          {value: 'bar', label: 'Bar'},
          {value: 'foo', label: 'Foo'},
        ]}
        value={['foo']}
      />,
    );

    displayedItems = screen.getAllByText('foo');
    expect(displayedItems.length).toEqual(1);
    expect(displayedItems[0]).toHaveTextContent('foo');

    rerender(
      <MultiSelect
        data={[
          {value: 'bar', label: 'Bar'},
          {value: 'foo', label: 'Foo'},
        ]}
        value={['foo', 'bar']}
      />,
    );

    displayedItems = [screen.getByText('foo'), screen.getByText('bar')];
    expect(displayedItems.length).toEqual(2);
    expect(displayedItems[0]).toHaveTextContent('foo');
    expect(displayedItems[1]).toHaveTextContent('bar');
  });

  test('should filter items', async () => {
    const items = [
      {value: 'bar', label: 'Bar'},
      {value: 'bat', label: 'Bat'},
      {value: 'foo', label: 'Foo'},
    ];

    render(<MultiSelect items={items} value={[]} />);

    const multiSelect = screen.getMultiSelectElement();
    fireEvent.click(multiSelect);

    expect(screen.getSelectItemElementsForMultiSelect().length).toEqual(3);

    await userEvent.type(multiSelect, 'ba');
    expect(screen.getSelectItemElementsForMultiSelect().length).toEqual(2);

    await userEvent.clear(multiSelect);
    await userEvent.type(multiSelect, 'F');
    expect(screen.getSelectItemElementsForMultiSelect().length).toEqual(1);
  });

  test('should select and remove items', async () => {
    const items = [
      {value: 'banana', label: 'Banana'},
      {value: 'apple', label: 'Apple'},
    ];

    render(<MultiSelect items={items} />);

    const multiSelect = screen.getMultiSelectElement();
    fireEvent.click(multiSelect);

    const options = screen.getSelectItemElementsForMultiSelect();
    fireEvent.click(options[0]);
    fireEvent.click(options[1]);

    let selectedItems = screen.getSelectedItems();
    expect(selectedItems.length).toEqual(2);
    expect(selectedItems[0]).toHaveTextContent('Banana');
    expect(selectedItems[1]).toHaveTextContent('Apple');

    const closeBtnElement = within(selectedItems[1]).getByRole('button', {
      hidden: true,
    });

    fireEvent.click(closeBtnElement);

    selectedItems = screen.getSelectedItems();
    expect(selectedItems.length).toEqual(1);
    expect(selectedItems[0]).toHaveTextContent('Banana');
  });
});
