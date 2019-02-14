/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

export const SEC_INFOS_CREATED = 'secinfos-created';
export const SEC_INFOS_SEVERITY = 'secinfos-severity';
export const SEC_INFOS_TYPE = 'secinfos-type';

export const secInfoCreatedLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.secinfos.getCreatedAggregates({filter}).then(r => r.data),
  SEC_INFOS_CREATED,
);

export const SecInfosCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={SEC_INFOS_CREATED}
    filter={filter}
    load={secInfoCreatedLoader}
    subscriptions={['secinfos.timer', 'secinfos.changed']}
  >
    {children}
  </Loader>
);

SecInfosCreatedLoader.propTypes = loaderPropTypes;

export const secInfosSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.secinfos.getSeverityAggregates({filter}).then(r => r.data),
  SEC_INFOS_SEVERITY,
);

export const SecInfosSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={SEC_INFOS_SEVERITY}
    filter={filter}
    load={secInfosSeverityLoader}
    subscriptions={['secinfos.timer', 'secinfos.changed']}
  >
    {children}
  </Loader>
);

SecInfosSeverityLoader.propTypes = loaderPropTypes;

export const secInfosTypeLoader = loadFunc(
  ({gmp, filter}) => gmp.secinfos.getTypeAggregates({filter}).then(r => r.data),
  SEC_INFOS_TYPE,
);

export const SecInfosTypeLoader = ({filter, children}) => (
  <Loader
    dataId={SEC_INFOS_TYPE}
    filter={filter}
    load={secInfosTypeLoader}
    subscriptions={['secinfos.timer', 'secinfos.changed']}
  >
    {children}
  </Loader>
);

SecInfosTypeLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
