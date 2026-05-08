/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
  USE_DEFAULT_RELOAD_INTERVAL_INACTIVE,
} from 'web/components/loading/Reload';
import {
  resolveRefetchInterval,
  transformRefetchIntervalFn,
} from 'web/queries/helpers';

const settings = {
  reloadInterval: 60000,
  reloadIntervalActive: 5000,
  reloadIntervalInactive: 120000,
};

describe('resolveRefetchInterval', () => {
  test.each<[string, number | false | undefined, number | false]>([
    ['returns false for NO_RELOAD (0)', NO_RELOAD, false],
    ['returns false for boolean false', false, false],
    [
      'returns reloadIntervalActive for USE_DEFAULT_RELOAD_INTERVAL_ACTIVE',
      USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
      settings.reloadIntervalActive,
    ],
    [
      'returns reloadIntervalInactive for USE_DEFAULT_RELOAD_INTERVAL_INACTIVE',
      USE_DEFAULT_RELOAD_INTERVAL_INACTIVE,
      settings.reloadIntervalInactive,
    ],
    [
      'returns reloadInterval for USE_DEFAULT_RELOAD_INTERVAL',
      USE_DEFAULT_RELOAD_INTERVAL,
      settings.reloadInterval,
    ],
    [
      'returns reloadInterval for undefined',
      undefined,
      settings.reloadInterval,
    ],
    [
      'returns reloadInterval for unknown negative numbers',
      -99,
      settings.reloadInterval,
    ],
    ['passes through positive numeric intervals unchanged', 30000, 30000],
  ])('%s', (_, interval, expected) => {
    expect(resolveRefetchInterval(interval, settings)).toBe(expected);
  });
});

describe('transformRefetchIntervalFn', () => {
  test.each<[string, number | false, number | false]>([
    [
      'resolves USE_DEFAULT_RELOAD_INTERVAL_ACTIVE to reloadIntervalActive',
      USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
      settings.reloadIntervalActive,
    ],
    ['resolves NO_RELOAD to false', NO_RELOAD, false],
    [
      'resolves USE_DEFAULT_RELOAD_INTERVAL to reloadInterval',
      USE_DEFAULT_RELOAD_INTERVAL,
      settings.reloadInterval,
    ],
    ['passes through positive numeric intervals unchanged', 15000, 15000],
  ])('%s', (_, returnValue, expected) => {
    const fn = () => returnValue;
    const transformed = transformRefetchIntervalFn(fn, settings);
    expect(transformed({state: {data: undefined}})).toBe(expected);
  });

  test('passes data from query state to the wrapped function', () => {
    const fn = (data: string | undefined) =>
      data === 'active' ? USE_DEFAULT_RELOAD_INTERVAL_ACTIVE : NO_RELOAD;
    const transformed = transformRefetchIntervalFn(fn, settings);

    expect(transformed({state: {data: 'active'}})).toBe(
      settings.reloadIntervalActive,
    );
    expect(transformed({state: {data: 'done'}})).toBe(false);
  });
});
