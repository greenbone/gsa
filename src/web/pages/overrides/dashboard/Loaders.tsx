/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const OVERRIDES_ACTIVE_DAYS = 'overrides-active-days';
export const OVERRIDES_CREATED = 'overrides-created';
export const OVERRIDES_WORD_COUNT = 'overrides-wordcount';

export const overridesActiveDaysLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getActiveDaysAggregates({filter}).then(r => r.data),
  OVERRIDES_ACTIVE_DAYS,
);

export const OverridesActiveDaysLoader = ({filter, children}) => (
  <Loader
    dataId={OVERRIDES_ACTIVE_DAYS}
    filter={filter}
    load={overridesActiveDaysLoadFunc}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

export const overridesCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getCreatedAggregates({filter}).then(r => r.data),
  OVERRIDES_CREATED,
);

export const OverridesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={OVERRIDES_CREATED}
    filter={filter}
    load={overridesCreatedLoadFunc}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

export const overridesWordCountLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getWordCountsAggregates({filter}).then(r => r.data),
  OVERRIDES_WORD_COUNT,
);

export const OverridesWordCountLoader = ({filter, children}) => (
  <Loader
    dataId={OVERRIDES_WORD_COUNT}
    filter={filter}
    load={overridesWordCountLoadFunc}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);
