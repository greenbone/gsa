/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import Select from 'web/components/form/Select';
import {
  getSelectElement,
  getSelectItemElements,
  openSelectElement,
} from 'web/components/testing';
import {render, fireEvent, screen} from 'web/utils/Testing';

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

    const {queryByRole} = render(<Select items={items} />);

    const element = getSelectElement();

    expect(queryByRole('option')).not.toBeInTheDocument();

    await openSelectElement(element);

    const domItems = getSelectItemElements();

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

    const element = getSelectElement();

    expect(element).toHaveAttribute('placeholder', 'Loading...');

    expect(getSelectItemElements().length).toEqual(0);

    await openSelectElement(element);

    expect(getSelectItemElements().length).toEqual(0);
  });

  test('should render error', () => {
    const items = [
      {
        value: '0',
        label: '--',
      },
    ];

    render(<Select errorContent="Some Error" items={items} />);

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

    render(<Select items={items} onChange={onChange} />);

    await openSelectElement();

    const domItems = getSelectItemElements();

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

    await openSelectElement();

    const domItems = getSelectItemElements();
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

    const input = getSelectElement();

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

    const input = getSelectElement();

    await openSelectElement(input);

    const domItems = getSelectItemElements();
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

    expect(getSelectItemElements().length).toEqual(3);

    const input = getSelectElement();

    fireEvent.change(input, {target: {value: 'ba'}});

    expect(getSelectItemElements().length).toEqual(2);

    fireEvent.change(input, {target: {value: 'F'}});

    expect(getSelectItemElements().length).toEqual(1);
  });

  describe('deprecated option rendering', () => {
    test.each([
      {
        label: 'Test Item',
        deprecated: '1',
        expectedText: 'Test Item (Deprecated)',
      },
      {
        label: 'Non-deprecated Item',
        deprecated: '0',
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

        const input = getSelectElement();

        await openSelectElement(input);

        const domItems = getSelectItemElements();

        expect(domItems[0]).toHaveTextContent(expectedText);
      },
    );
  });
});
