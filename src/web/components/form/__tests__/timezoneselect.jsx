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

import timezones from 'gmp/timezones';

import {render, userEvent} from 'web/utils/testing';

import {
  openSelectElement,
  getSelectItemElements,
  getSelectElement,
} from 'web/components/testing';

import TimezoneSelect from '../timezoneselect';

describe('TimezoneSelect tests', () => {
  test('should render', () => {
    const {element} = render(<TimezoneSelect />);

    expect(element).toBeInTheDocument();
  });

  test('should render all timezones in selection', async () => {
    render(<TimezoneSelect />);

    await openSelectElement();

    expect(getSelectItemElements().length).toEqual(timezones.length + 1);
  });

  test('should call onChange handler', async () => {
    const handler = testing.fn();
    render(<TimezoneSelect onChange={handler} />);

    await openSelectElement();

    const items = getSelectItemElements();
    await userEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, undefined);
  });

  test('should call onChange handler with name', async () => {
    const handler = testing.fn();
    render(<TimezoneSelect name="foo" onChange={handler} />);

    await openSelectElement();

    const items = getSelectItemElements();
    await userEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, 'foo');
  });

  test('should render selected value', () => {
    const timezone = timezones[1]; // eslint-disable-line prefer-destructuring
    render(<TimezoneSelect value={timezone.name} />);

    const input = getSelectElement();
    expect(input).toHaveValue(timezone.name);
  });
});
