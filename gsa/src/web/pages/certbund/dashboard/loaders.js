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

export const CERTBUNDS_SEVERITY = 'certbunds-severity';
export const CERTBUNDS_CREATED = 'certbunds-created';

export const certBundCreatedLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.certbunds.getCreatedAggregates({filter}).then(r => r.data),
  CERTBUNDS_CREATED,
);

export const CertBundCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CERTBUNDS_CREATED}
    filter={filter}
    load={certBundCreatedLoader}
    subscriptions={['certbunds.timer', 'certbunds.changed']}
  >
    {children}
  </Loader>
);

CertBundCreatedLoader.propTypes = loaderPropTypes;

export const certBundSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.certbunds.getSeverityAggregates({filter}).then(r => r.data),
  CERTBUNDS_SEVERITY,
);

export const CertBundSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CERTBUNDS_SEVERITY}
    filter={filter}
    load={certBundSeverityLoader}
    subscriptions={['certbunds.timer', 'certbunds.changed']}
  >
    {children}
  </Loader>
);

CertBundSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
