/* Copyright (C) 2018-2022 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import {describe, test, expect, testing} from '@gsa/testing';

import {render, fireEvent, screen, userEvent, act} from 'web/utils/testing';

import Select from '../select';

export const openSelectElement = async select => {
  await act(async () => {
    select = select || getSelectElement();
    await userEvent.click(select);
  });
};

export const getItemElements = () => {
  return screen.queryAllByRole('option');
};

export const getSelectElement = () => {
  const select = screen.queryByRole('searchbox');
  if (select) {
    return select;
  }
  return screen.getByRole('textbox');
};

export const clickItem = async item => {
  await act(async () => {
    await userEvent.click(item);
  });
};

describe('Select component tests', () => {
  test('should render', () => {
    const {element} = render(<Select />);
    expect(element).toBeInTheDocument();
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

    render(<Select items={items} />);

    const element = getSelectElement();

    expect(getItemElements().length).toEqual(0);

    await openSelectElement(element);

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

    render(<Select items={items} isLoading={true} />);

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

    const domItems = getItemElements();

    expect(domItems.length).toEqual(2);

    await clickItem(domItems[0]);

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

    render(<Select name="abc" items={items} onChange={onChange} />);

    await openSelectElement();

    const domItems = getItemElements();

    await clickItem(domItems[0]);

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

    const domItems = getItemElements();

    await clickItem(domItems[1]);

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

    expect(getItemElements().length).toEqual(3);

    const input = getSelectElement();

    fireEvent.change(input, {target: {value: 'ba'}});

    expect(getItemElements().length).toEqual(2);

    fireEvent.change(input, {target: {value: 'F'}});

    expect(getItemElements().length).toEqual(1);
  });
});

// vim: set ts=2 sw=2 tw=80:
