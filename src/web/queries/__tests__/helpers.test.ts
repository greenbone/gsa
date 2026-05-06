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
  test('returns false for NO_RELOAD (0)', () => {
    expect(resolveRefetchInterval(NO_RELOAD, settings)).toBe(false);
  });

  test('returns false for boolean false', () => {
    expect(resolveRefetchInterval(false, settings)).toBe(false);
  });

  test('returns reloadIntervalActive for USE_DEFAULT_RELOAD_INTERVAL_ACTIVE', () => {
    expect(
      resolveRefetchInterval(USE_DEFAULT_RELOAD_INTERVAL_ACTIVE, settings),
    ).toBe(settings.reloadIntervalActive);
  });

  test('returns reloadIntervalInactive for USE_DEFAULT_RELOAD_INTERVAL_INACTIVE', () => {
    expect(
      resolveRefetchInterval(USE_DEFAULT_RELOAD_INTERVAL_INACTIVE, settings),
    ).toBe(settings.reloadIntervalInactive);
  });

  test('returns reloadInterval for USE_DEFAULT_RELOAD_INTERVAL', () => {
    expect(
      resolveRefetchInterval(USE_DEFAULT_RELOAD_INTERVAL, settings),
    ).toBe(settings.reloadInterval);
  });

  test('returns reloadInterval for undefined', () => {
    expect(resolveRefetchInterval(undefined, settings)).toBe(
      settings.reloadInterval,
    );
  });

  test('returns reloadInterval for unknown negative numbers', () => {
    expect(resolveRefetchInterval(-99, settings)).toBe(settings.reloadInterval);
  });

  test('passes through positive numeric intervals unchanged', () => {
    expect(resolveRefetchInterval(30000, settings)).toBe(30000);
  });
});

describe('transformRefetchIntervalFn', () => {
  test('resolves USE_DEFAULT_RELOAD_INTERVAL_ACTIVE returned by the wrapped function', () => {
    const fn = () => USE_DEFAULT_RELOAD_INTERVAL_ACTIVE;
    const transformed = transformRefetchIntervalFn(fn, settings);
    expect(transformed({state: {data: undefined}})).toBe(
      settings.reloadIntervalActive,
    );
  });

  test('resolves NO_RELOAD returned by the wrapped function to false', () => {
    const fn = () => NO_RELOAD;
    const transformed = transformRefetchIntervalFn(fn, settings);
    expect(transformed({state: {data: undefined}})).toBe(false);
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

  test('resolves USE_DEFAULT_RELOAD_INTERVAL returned by the wrapped function', () => {
    const fn = () => USE_DEFAULT_RELOAD_INTERVAL;
    const transformed = transformRefetchIntervalFn(fn, settings);
    expect(transformed({state: {data: undefined}})).toBe(settings.reloadInterval);
  });

  test('passes through positive numeric intervals returned by the wrapped function', () => {
    const fn = () => 15000;
    const transformed = transformRefetchIntervalFn(fn, settings);
    expect(transformed({state: {data: undefined}})).toBe(15000);
  });
});
