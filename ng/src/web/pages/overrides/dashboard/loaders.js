/* Greenbone Security Assistant
 *
 * Authors:
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2018 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
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
  ({gmp, filter}) => gmp.overrides.getActiveDaysAggregates({filter})
    .then(r => r.data),
  OVERRIDES_ACTIVE_DAYS);

export const OverridesActiveDaysLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVERRIDES_ACTIVE_DAYS}
    filter={filter}
    load={overridesActiveDaysLoader}
    subscriptions={[
      'overrides.timer',
      'overrides.changed',
    ]}
  >
    {children}
  </Loader>
);

OverridesActiveDaysLoader.propTypes = loaderPropTypes;

export const overridesCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.overrides.getCreatedAggregates({filter})
    .then(r => r.data),
  OVERRIDES_CREATED);

export const OverridesCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVERRIDES_CREATED}
    filter={filter}
    load={overridesCreatedLoader}
    subscriptions={[
      'overrides.timer',
      'overrides.changed',
    ]}
  >
    {children}
  </Loader>
);

OverridesCreatedLoader.propTypes = loaderPropTypes;


export const overridesWordCountLoader = loadFunc(
  ({gmp, filter}) => gmp.overrides.getWordCountsAggregates({filter})
    .then(r => r.data),
  OVERRIDES_WORDCOUNT);

export const OverridesWordCountLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVERRIDES_WORDCOUNT}
    filter={filter}
    load={overridesWordCountLoader}
    subscriptions={[
      'overrides.timer',
      'overrides.changed',
    ]}
  >
    {children}
  </Loader>
);

OverridesWordCountLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
