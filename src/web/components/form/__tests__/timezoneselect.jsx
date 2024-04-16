/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import timezones from 'gmp/timezones';

import {render, userEvent} from 'web/utils/testing';

import TimezoneSelect from '../timezoneselect';

import {openSelectElement, getItemElements, getSelectElement} from './select';

describe('TimezoneSelect tests', () => {
  test('should render', () => {
    const {element} = render(<TimezoneSelect />);

    expect(element).toBeInTheDocument();
  });

  test('should render all timezones in selection', async () => {
    render(<TimezoneSelect />);

    await openSelectElement();

    expect(getItemElements().length).toEqual(timezones.length + 1);
  });

  test('should call onChange handler', async () => {
    const handler = testing.fn();
    render(<TimezoneSelect onChange={handler} />);

    await openSelectElement();

    const items = getItemElements();
    await userEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, undefined);
  });

  test('should call onChange handler with name', async () => {
    const handler = testing.fn();
    render(<TimezoneSelect name="foo" onChange={handler} />);

    await openSelectElement();

    const items = getItemElements();
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
