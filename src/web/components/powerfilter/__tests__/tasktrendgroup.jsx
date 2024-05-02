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

import TaskTrendGroup from 'web/components/powerfilter/tasktrendgroup';
import Filter from 'gmp/models/filter';
import {
  clickElement,
  getSelectElement,
  getSelectItemElements,
  openSelectElement,
} from 'web/components/testing';

describe('Task Trend Selector Tests', () => {
  test('should render', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');
    const {element} = render(
      <TaskTrendGroup filter={filter} onChange={onChange} />,
    );

    expect(element).toBeInTheDocument();
  });

  test('should return items', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    render(<TaskTrendGroup filter={filter} onChange={onChange} />);

    let domItems = getSelectItemElements();

    expect(domItems.length).toEqual(0);

    await openSelectElement();

    domItems = getSelectItemElements();

    expect(domItems.length).toEqual(5);
    expect(domItems[0]).toHaveTextContent('Severity increased');
    expect(domItems[1]).toHaveTextContent('Severity decreased');
    expect(domItems[2]).toHaveTextContent('Vulnerability count increased');
  });

  test('should parse filter', () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=same');

    render(<TaskTrendGroup filter={filter} onChange={onChange} />);

    const select = getSelectElement();
    expect(select).toHaveValue('Vulnerabilities did not change');
  });

  test('should call onChange handler', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    render(<TaskTrendGroup filter={filter} onChange={onChange} />);

    await openSelectElement();

    const domItems = getSelectItemElements();
    await clickElement(domItems[0]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('up', 'trend');
  });

  test('should change value', async () => {
    const onChange = testing.fn();
    const filter = Filter.fromString('trend=down');

    render(<TaskTrendGroup trend="up" filter={filter} onChange={onChange} />);

    const select = getSelectElement();
    expect(select).toHaveValue('Severity increased');

    await openSelectElement();

    const domItems = getSelectItemElements();
    await clickElement(domItems[2]);

    expect(onChange).toBeCalled();
    expect(onChange).toBeCalledWith('more', 'trend');
  });
});
