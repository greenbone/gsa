/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const OVERRIDES_ACTIVE_DAYS = 'overrides-active-days';
export const OVERRIDES_CREATED = 'overrides-created';
export const OVERRIDES_WORDCOUNT = 'overrides-wordcount';

export const overridesActiveDaysLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getActiveDaysAggregates({filter}).then(r => r.data),
  OVERRIDES_ACTIVE_DAYS,
);

export const OverridesActiveDaysLoader = ({filter, children}) => (
  <Loader
    dataId={OVERRIDES_ACTIVE_DAYS}
    filter={filter}
    load={overridesActiveDaysLoader}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

OverridesActiveDaysLoader.propTypes = loaderPropTypes;

export const overridesCreatedLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getCreatedAggregates({filter}).then(r => r.data),
  OVERRIDES_CREATED,
);

export const OverridesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={OVERRIDES_CREATED}
    filter={filter}
    load={overridesCreatedLoader}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

OverridesCreatedLoader.propTypes = loaderPropTypes;

export const overridesWordCountLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.overrides.getWordCountsAggregates({filter}).then(r => r.data),
  OVERRIDES_WORDCOUNT,
);

export const OverridesWordCountLoader = ({filter, children}) => (
  <Loader
    dataId={OVERRIDES_WORDCOUNT}
    filter={filter}
    load={overridesWordCountLoader}
    subscriptions={['overrides.timer', 'overrides.changed']}
  >
    {children}
  </Loader>
);

OverridesWordCountLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
