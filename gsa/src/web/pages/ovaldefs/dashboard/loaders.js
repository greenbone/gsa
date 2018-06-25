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

export const OVALDEFS_CLASS = 'ovaldefs-class';
export const OVALDEFS_CREATED = 'ovaldefs-created';
export const OVALDEFS_SEVERITY = 'ovaldefs-severity';

export const ovaldefCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.ovaldefs.getCreatedAggregates({filter})
    .then(r => r.data),
  OVALDEFS_CREATED);

export const OvaldefCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVALDEFS_CREATED}
    filter={filter}
    load={ovaldefCreatedLoader}
    subscriptions={[
      'ovaldefs.timer',
      'ovaldefs.changed',
    ]}
  >
    {children}
  </Loader>
);

OvaldefCreatedLoader.propTypes = loaderPropTypes;

export const ovaldefClassLoader = loadFunc(
  ({gmp, filter}) => gmp.ovaldefs.getClassAggregates({filter})
    .then(r => r.data),
  OVALDEFS_CLASS);

export const OvaldefClassLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVALDEFS_CLASS}
    filter={filter}
    load={ovaldefClassLoader}
    subscriptions={[
      'ovaldefs.timer',
      'ovaldefs.changed',
    ]}
  >
    {children}
  </Loader>
);

OvaldefClassLoader.propTypes = loaderPropTypes;

export const ovaldefSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.ovaldefs.getSeverityAggregates({filter})
    .then(r => r.data),
  OVALDEFS_SEVERITY);

export const OvaldefSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVALDEFS_SEVERITY}
    filter={filter}
    load={ovaldefSeverityLoader}
    subscriptions={[
      'ovaldefs.timer',
      'ovaldefs.changed',
    ]}
  >
    {children}
  </Loader>
);

OvaldefSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
