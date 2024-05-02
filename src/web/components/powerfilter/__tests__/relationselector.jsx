/* Copyright (C) 2019-2022 Greenbone AG
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

import {render} from 'web/utils/testing';

import {
  openSelectElement,
  getSelectItemElements,
  clickElement,
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

    expect(element).toBeInTheDocument();
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

    await clickElement(domItems[1]);

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

    await clickElement(domItems[3]);

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
