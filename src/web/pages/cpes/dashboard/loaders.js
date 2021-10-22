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

export const CPES_CREATED = 'cpes-created';
export const CPES_SEVERITY = 'cpes-severity';

export const cpeCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.cpes.getCreatedAggregates({filter}).then(r => r.data),
  CPES_CREATED,
);

export const CpesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CPES_CREATED}
    filter={filter}
    load={cpeCreatedLoader}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);

CpesCreatedLoader.propTypes = loaderPropTypes;

export const cpeSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.cpes.getSeverityAggregates({filter}).then(r => r.data),
  CPES_SEVERITY,
);

export const CpesSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CPES_SEVERITY}
    filter={filter}
    load={cpeSeverityLoader}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);

CpesSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
