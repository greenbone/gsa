/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
  USE_DEFAULT_RELOAD_INTERVAL_INACTIVE,
} from 'web/components/loading/Reload';

export type RefetchIntervalFn<TData> = (
  data: TData | undefined,
) => number | false;

interface ReloadSettings {
  reloadInterval: number;
  reloadIntervalActive: number;
  reloadIntervalInactive: number;
}

/**
 * Resolves a reload interval value (which may be a special constant like
 * NO_RELOAD, USE_DEFAULT_RELOAD_INTERVAL_ACTIVE, etc.) into an actual
 * millisecond interval or `false` for React Query's refetchInterval.
 */
export const resolveRefetchInterval = (
  interval: number | false | undefined,
  settings: ReloadSettings,
): number | false => {
  switch (interval) {
    case false:
    case NO_RELOAD:
      return false;
    case USE_DEFAULT_RELOAD_INTERVAL_ACTIVE:
      return settings.reloadIntervalActive;
    case USE_DEFAULT_RELOAD_INTERVAL_INACTIVE:
      return settings.reloadIntervalInactive;
    case undefined:
    case USE_DEFAULT_RELOAD_INTERVAL:
      return settings.reloadInterval;
    default:
      if (typeof interval === 'number' && interval < 0) {
        return settings.reloadInterval;
      }
      return interval;
  }
};

/**
 * Wraps a RefetchIntervalFn so that its return values (which may be special
 * constants) are resolved into actual millisecond intervals for React Query.
 */
export const transformRefetchIntervalFn =
  <TData>(
    refetchInterval: RefetchIntervalFn<TData>,
    settings: ReloadSettings,
  ) =>
  (query: {state: {data: TData | undefined}}): number | false =>
    resolveRefetchInterval(refetchInterval(query.state.data), settings);
