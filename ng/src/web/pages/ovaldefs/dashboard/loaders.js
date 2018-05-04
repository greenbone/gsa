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
} from '../../../components/dashboard2/data/loader';

export const OVALDEF_CLASS = 'ovaldef-class';
export const OVALDEF_CREATED = 'ovaldef-by-created';


export const ovaldefCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.ovaldefs.getCreatedAggregates({filter})
    .then(r => r.data),
  OVALDEF_CREATED);

export const OvaldefCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVALDEF_CREATED}
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
  OVALDEF_CLASS);

export const OvaldefClassLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVALDEF_CLASS}
    filter={filter}
    load={ovaldefClassLoader}
    subscriptions={[
      'ovaldef.timer',
      'ovaldef.changed',
    ]}
  >
    {children}
  </Loader>
);

OvaldefClassLoader.propTypes = loaderPropTypes;

export const OVALDEF_SEVERITY_CLASS = 'ovaldef-severity-class';

export const ovaldefSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.ovaldefs.getSeverityAggregates({filter})
    .then(r => r.data),
  OVALDEF_SEVERITY_CLASS);

export const OvaldefSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={OVALDEF_SEVERITY_CLASS}
    filter={filter}
    load={ovaldefSeverityLoader}
    subscriptions={[
      'ovaldef.timer',
      'ovaldef.changed',
    ]}
  >
    {children}
  </Loader>
);

OvaldefSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
