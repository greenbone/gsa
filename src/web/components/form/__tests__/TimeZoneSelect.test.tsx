/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import timezones from 'gmp/timezones';
import TimezoneSelect from 'web/components/form/TimeZoneSelect';
import {
  openSelectElement,
  getSelectItemElements,
  getSelectElement,
} from 'web/components/testing';
import {fireEvent, render} from 'web/utils/Testing';

describe('TimezoneSelect tests', () => {
  test('should render', () => {
    const {element} = render(<TimezoneSelect />);

    expect(element).toBeInTheDocument();
  });

  test('should render all timezones in selection', async () => {
    render(<TimezoneSelect />);

    await openSelectElement();

    expect(getSelectItemElements().length).toEqual(timezones.length);
  });

  test('should call onChange handler', async () => {
    const handler = testing.fn();
    render(<TimezoneSelect onChange={handler} />);

    await openSelectElement();

    const items = getSelectItemElements();
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[1], undefined);
  });

  test('should call onChange handler with name', async () => {
    const handler = testing.fn();
    render(<TimezoneSelect name="foo" onChange={handler} />);

    await openSelectElement();

    const items = getSelectItemElements();
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[1], 'foo');
  });

  test('should render selected value', () => {
    const timezone = timezones[1];
    render(<TimezoneSelect value={timezone} />);

    const input = getSelectElement();
    expect(input).toHaveValue(timezone);
  });
});
