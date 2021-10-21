/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
/* eslint-disable no-console */
import React from 'react';

import Date, {setLocale} from 'gmp/models/date';

import {rendererWith} from 'web/utils/testing';

import DateTime from '../datetime';
import {setTimezone} from 'web/store/usersettings/actions';

setLocale('en');

describe('DateTime render tests', () => {
  test('should render nothing if date is undefined', () => {
    const {render} = rendererWith({store: true});

    const {element} = render(<DateTime />);

    expect(element).toBeNull();
  });

  test('should render nothing for invalid date', () => {
    // deactivate console.warn for test
    const consolewarn = console.warn;
    console.warn = () => {};

    const {render} = rendererWith({store: true});

    const date = Date('foo');

    expect(date.isValid()).toEqual(false);

    const {element} = render(<DateTime date={date} />);

    expect(element).toBeNull();

    console.warn = consolewarn;
  });

  test('should call formatter', () => {
    const formatter = jest.fn().mockReturnValue('foo');
    const {render, store} = rendererWith({store: true});

    const date = Date('2019-01-01T12:00:00Z');

    expect(date.isValid()).toEqual(true);

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(
      <DateTime date={date} formatter={formatter} />,
    );

    expect(formatter).toHaveBeenCalledWith(date, 'CET');
    expect(baseElement).toHaveTextContent('foo');
  });

  test('should render with default formatter', () => {
    const {render, store} = rendererWith({store: true});

    const date = Date('2019-01-01T12:00:00Z');

    expect(date.isValid()).toEqual(true);

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<DateTime date={date} />);

    expect(baseElement).toHaveTextContent('Tue, Jan 1, 2019 1:00 PM CET');
  });
});
