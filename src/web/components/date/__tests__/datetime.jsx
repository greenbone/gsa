/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable no-console */
import {
  describe,
  test,
  expect,
  testing,
  beforeAll,
  afterAll,
} from '@gsa/testing';

import Date from 'gmp/models/date';

import {rendererWith} from 'web/utils/testing';

import {setTimezone} from 'web/store/usersettings/actions';

import DateTime from '../datetime';
import {loadingActions} from 'web/store/usersettings/defaults/actions';

const getSetting = testing.fn().mockResolvedValue({});

const gmp = {
  user: {
    getSetting,
  },
};

describe('DateTime render tests', () => {
  let originalSetItem;

  beforeAll(() => {
    originalSetItem = localStorage.setItem;
    localStorage.setItem = testing.fn();
  });

  afterAll(() => {
    localStorage.setItem = originalSetItem;
  });

  const removeStyleTags = html => {
    let previous;
    do {
      previous = html;
      html = html.replace(/<style[^>]*>.*?<\/style>/g, '');
    } while (html !== previous);
    return html;
  };

  test('should render nothing if date is undefined', () => {
    const {render, store} = rendererWith({gmp, store: true});
    store.dispatch(
      loadingActions.success({
        userinterfacetimeformat: {value: 12},
        userinterfacedateformat: {value: 'wdmy'},
      }),
    );

    const {container} = render(<DateTime />);

    const content = removeStyleTags(container.innerHTML).trim();
    expect(content).toBe('');
  });

  test('should render nothing for invalid date', () => {
    // deactivate console.warn for test
    const consoleWarn = console.warn;
    console.warn = () => {};

    const {render, store} = rendererWith({gmp, store: true});
    store.dispatch(
      loadingActions.success({
        userinterfacetimeformat: {value: 12},
        userinterfacedateformat: {value: 'wdmy'},
      }),
    );

    const date = Date('foo');

    expect(date.isValid()).toEqual(false);

    const {container} = render(<DateTime date={date} />);

    const content = removeStyleTags(container.innerHTML).trim();
    expect(content).toBe('');

    console.warn = consoleWarn;
  });

  test('should call formatter', () => {
    const formatter = testing.fn().mockReturnValue('foo');

    const {render, store} = rendererWith({gmp, store: true});

    const date = Date('2019-01-01T12:00:00Z');

    expect(date.isValid()).toEqual(true);

    store.dispatch(setTimezone('CET'));

    localStorage.setItem('userInterfaceTimeFormat', 12);
    localStorage.setItem('userInterfaceDateFormat', 'wdmy');

    const {baseElement} = render(
      <DateTime date={date} formatter={formatter} />,
    );

    expect(formatter).toHaveBeenCalledWith(date, 'CET');
    expect(baseElement).toHaveTextContent('foo');
  });

  test.each([
    [
      'should render with default formatter',
      {
        userinterfacetimeformat: {value: undefined},
        userinterfacedateformat: {value: undefined},
      },
      'Tue, Jan 1, 2019 1:00 PM CET',
    ],
    [
      'should render with 24 h and WeekDay, Month, Day, Year formatter',
      {
        userinterfacetimeformat: {value: 24},
        userinterfacedateformat: {value: 'wmdy'},
      },
      'Tue, Jan 1, 2019 13:00 CET',
    ],
    [
      'should render with 12 h and WeekDay, Day, Month, Year formatter',
      {
        userinterfacetimeformat: {value: 12},
        userinterfacedateformat: {value: 'wdmy'},
      },
      'Tue, 1 Jan 2019 1:00 PM CET',
    ],
  ])('%s', (_, settings, expectedText) => {
    const {render, store} = rendererWith({gmp, store: true});

    localStorage.setItem(
      'userInterfaceTimeFormat',
      settings.userinterfacetimeformat.value,
    );
    localStorage.setItem(
      'userInterfaceDateFormat',
      settings.userinterfacedateformat.value,
    );

    const date = Date('2019-01-01T12:00:00Z');
    expect(date.isValid()).toEqual(true);

    store.dispatch(setTimezone('CET'));

    const {baseElement} = render(<DateTime date={date} />);
    expect(baseElement).toHaveTextContent(expectedText);
  });
});
