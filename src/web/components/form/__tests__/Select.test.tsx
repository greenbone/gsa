/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState} from 'react';
import {describe, test, expect, testing} from '@gsa/testing';
import {
  openSelectElement,
  screen,
  render,
  fireEvent,
  getSelectItemElementsForSelect,
  changeInputValue,
} from 'web/testing';
import Select from 'web/components/form/Select';

describe('Select component tests', () => {
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

    render(<Select items={items} />);

    const element = screen.getSelectElement();

    expect(screen.queryByRole('option')).not.toBeInTheDocument();

    const domItems = await getSelectItemElementsForSelect(element);

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

    render(<Select isLoading={true} items={items} />);

    const element = screen.getSelectElement();

    expect(element).toHaveAttribute('placeholder', 'Loading...');

    expect(screen.getSelectItemElements().length).toEqual(0);

    await openSelectElement(element);

    expect(screen.getSelectItemElements().length).toEqual(0);
  });

  test('should render error', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    render(<Select errorContent="Some Error" items={items} />);

    screen.getSelectElement();
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

    render(<Select items={items} onChange={onChange} />);

    const domItems = await getSelectItemElementsForSelect();
    expect(domItems.length).toEqual(2);
    fireEvent.click(domItems[0]);
    expect(onChange).toHaveBeenCalledWith('bar', undefined);
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

    render(<Select items={items} name="abc" onChange={onChange} />);

    const domItems = await getSelectItemElementsForSelect();
    fireEvent.click(domItems[0]);
    expect(onChange).toHaveBeenCalledWith('bar', 'abc');
  });

  test('should render value', async () => {
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

    render(<Select items={items} value="bar" onChange={onChange} />);

    const input = screen.getSelectElement();
    expect(input).toHaveValue('Bar');
  });

  test('should call change handler when changing item', async () => {
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

    render(<Select items={items} value="bar" onChange={onChange} />);

    const input = screen.getSelectElement();
    const domItems = await getSelectItemElementsForSelect(input);
    fireEvent.click(domItems[1]);
    expect(onChange).toHaveBeenCalledWith('foo', undefined);
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

    render(<Select items={items} value="bar" />);

    await openSelectElement();
    expect(screen.getSelectItemElements().length).toEqual(3);

    const input = screen.getSelectElement();
    changeInputValue(input, 'ba');
    expect(screen.getSelectItemElements().length).toEqual(2);

    changeInputValue(input, 'F');
    expect(screen.getSelectItemElements().length).toEqual(1);
  });

  test('should update value when items change', async () => {
    const TestComponent = ({items, value}) => {
      const [currentValue, setCurrentValue] = useState(value);

      return (
        <Select
          items={items}
          value={currentValue}
          onChange={newValue => setCurrentValue(newValue)}
        />
      );
    };
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

    render(<TestComponent items={items} value="bar" />);

    const input = screen.getSelectElement();
    expect(input).toHaveValue('Bar');

    const selectItems = await getSelectItemElementsForSelect(input);
    fireEvent.click(selectItems[1]);
    expect(input).toHaveValue('Foo');
  });

  describe('deprecated option rendering', () => {
    test.each([
      {
        label: 'Test Item',
        deprecated: true,
        expectedText: 'Test Item (Deprecated)',
      },
      {
        label: 'Non-deprecated Item',
        deprecated: false,
        expectedText: 'Non-deprecated Item',
      },
      {
        label: 'Non-deprecated Item',
        deprecated: undefined,
        expectedText: 'Non-deprecated Item',
      },
    ])(
      'renders $label correctly with deprecated status $deprecated',
      async ({label, deprecated, expectedText}) => {
        const items = [
          {
            value: 'bar',
            label,
            deprecated,
          },
        ];

        render(<Select items={items} />);

        const input = screen.getSelectElement();
        const domItems = await getSelectItemElementsForSelect(input);
        expect(domItems[0]).toHaveTextContent(expectedText);
      },
    );
  });
});
