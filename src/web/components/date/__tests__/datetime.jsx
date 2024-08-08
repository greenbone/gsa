/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable no-console */
import {describe, test, expect, testing} from '@gsa/testing';

import Date from 'gmp/models/date';

import {rendererWith} from 'web/utils/testing';

import {setTimezone} from 'web/store/usersettings/actions';

import DateTime from '../datetime';

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
    const formatter = testing.fn().mockReturnValue('foo');
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
