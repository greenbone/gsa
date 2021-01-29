/* Copyright (C) 2018-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const NVTS_FAMILY = 'nvt-family';
export const NVTS_SEVERITY = 'nvt-severity';
export const NVTS_QOD = 'nvt-qod';
export const NVTS_QOD_TYPE = 'nvt-qod-type';
export const NVTS_CREATED = 'nvt-created';

export const nvtFamilyLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getFamilyAggregates({filter}).then(r => r.data),
  NVTS_FAMILY,
);

export const NvtsFamilyLoader = ({filter, children}) => (
  <Loader
    dataId={NVTS_FAMILY}
    filter={filter}
    load={nvtFamilyLoader}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

NvtsFamilyLoader.propTypes = loaderPropTypes;

export const nvtSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getSeverityAggregates({filter}).then(r => r.data),
  NVTS_SEVERITY,
);

export const NvtsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={NVTS_SEVERITY}
    filter={filter}
    load={nvtSeverityLoader}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

NvtsSeverityLoader.propTypes = loaderPropTypes;

export const nvtQodLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getQodAggregates({filter}).then(r => r.data),
  NVTS_QOD,
);

export const NvtsQodLoader = ({filter, children}) => (
  <Loader
    dataId={NVTS_QOD}
    filter={filter}
    load={nvtQodLoader}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

NvtsQodLoader.propTypes = loaderPropTypes;

export const nvtQodTypeLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getQodTypeAggregates({filter}).then(r => r.data),
  NVTS_QOD_TYPE,
);

export const NvtsQodTypeLoader = ({filter, children}) => (
  <Loader
    dataId={NVTS_QOD_TYPE}
    filter={filter}
    load={nvtQodTypeLoader}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

NvtsQodTypeLoader.propTypes = loaderPropTypes;

export const nvtCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.nvts.getCreatedAggregates({filter}).then(r => r.data),
  NVTS_CREATED,
);

export const NvtCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={NVTS_CREATED}
    filter={filter}
    load={nvtCreatedLoader}
    subscriptions={['nvts.timer', 'nvts.changed']}
  >
    {children}
  </Loader>
);

NvtCreatedLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
