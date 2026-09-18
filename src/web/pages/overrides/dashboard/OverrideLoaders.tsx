/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CreatedData} from 'web/components/dashboard/display/created/created-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';

interface ActiveDaysGroups {
  value: number;
  count: number;
  bulked?: boolean;
}

export interface ActiveDaysData {
  groups?: ActiveDaysGroups[];
}

interface OverrideWordCloudDataGroup {
  count: number;
  value: string;
}

export interface OverrideWordCloudData {
  groups?: OverrideWordCloudDataGroup[];
}

export const OVERRIDES_ACTIVE_DAYS = 'overrides-active-days';
export const OVERRIDES_CREATED = 'overrides-created';
export const OVERRIDES_WORD_COUNT = 'overrides-wordcount';

const overridesActiveDaysLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getActiveDaysAggregates({filter}).then(r => r.data),
  OVERRIDES_ACTIVE_DAYS,
);

export const OverridesActiveDaysLoader = ({
  filter,
  children,
}: DisplayLoaderProps<ActiveDaysData>) => (
  <Loader
    dataId={OVERRIDES_ACTIVE_DAYS}
    filter={filter}
    load={overridesActiveDaysLoadFunc}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

const overridesCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getCreatedAggregates({filter}).then(r => r.data),
  OVERRIDES_CREATED,
);

export const OverridesCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={OVERRIDES_CREATED}
    filter={filter}
    load={overridesCreatedLoadFunc}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

const overridesWordCountLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getWordCountsAggregates({filter}).then(r => r.data),
  OVERRIDES_WORD_COUNT,
);

export const OverridesWordCountLoader = ({
  filter,
  children,
}: DisplayLoaderProps<OverrideWordCloudData>) => (
  <Loader
    dataId={OVERRIDES_WORD_COUNT}
    filter={filter}
    load={overridesWordCountLoadFunc}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);
