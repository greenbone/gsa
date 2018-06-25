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

export const CPES_CREATED = 'cpes-created';
export const CPES_SEVERITY = 'cpes-severity';

export const cpeCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.cpes.getCreatedAggregates({filter})
    .then(r => r.data),
  CPES_CREATED);

export const CpesCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={CPES_CREATED}
    filter={filter}
    load={cpeCreatedLoader}
    subscriptions={[
      'cpes.timer',
      'cpes.changed',
    ]}
  >
    {children}
  </Loader>
);

CpesCreatedLoader.propTypes = loaderPropTypes;

export const cpeSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.cpes.getSeverityAggregates({filter})
    .then(r => r.data),
  CPES_SEVERITY);

export const CpesSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={CPES_SEVERITY}
    filter={filter}
    load={cpeSeverityLoader}
    subscriptions={[
      'cpes.timer',
      'cpes.changed',
    ]}
  >
    {children}
  </Loader>
);

CpesSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
