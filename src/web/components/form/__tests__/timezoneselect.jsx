/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {setLocale} from 'gmp/locale/lang';
import timezones from 'gmp/timezones';

import {render, fireEvent} from 'web/utils/testing';

import TimezoneSelect from '../timezoneselect';

setLocale('en');

describe('TimezoneSelect tests', () => {
  test('should render', () => {
    const {element, getByTestId} = render(<TimezoneSelect />);

    const selected = getByTestId('select-selected-value');
    expect(selected).toHaveTextContent('Coordinated Universal Time/UTC');

    expect(element).toBeVisible();
  });

  test('should render all timezones in selection', () => {
    const {getByTestId, getAllByTestId} = render(<TimezoneSelect />);

    const button = getByTestId('select-open-button');
    fireEvent.click(button);

    const items = getAllByTestId('select-item');
    expect(items.length).toEqual(timezones.length + 1);
  });

  test('should call onChange handler', () => {
    const handler = testing.fn();
    const {getByTestId, getAllByTestId} = render(
      <TimezoneSelect onChange={handler} />,
    );

    const button = getByTestId('select-open-button');
    fireEvent.click(button);

    const items = getAllByTestId('select-item');
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, undefined);
  });

  test('should call onChange handler with name', () => {
    const handler = testing.fn();
    const {getByTestId, getAllByTestId} = render(
      <TimezoneSelect name="foo" onChange={handler} />,
    );

    const button = getByTestId('select-open-button');
    fireEvent.click(button);

    const items = getAllByTestId('select-item');
    fireEvent.click(items[1]);

    expect(handler).toHaveBeenCalledWith(timezones[0].name, 'foo');
  });

  test('should render selected value', () => {
    const timezone = timezones[1]; // eslint-disable-line prefer-destructuring
    const {getByTestId} = render(<TimezoneSelect value={timezone.name} />);

    const selected = getByTestId('select-selected-value');
    expect(selected).toHaveTextContent(timezone.name);
  });
});
