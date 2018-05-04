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

export const CERTBUND_SEVERITY_CLASS = 'certbund-severity-class';
export const CERTBUND_CREATED = 'certbund-by-created';

export const certBundCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.certbundadvs.getCreatedAggregates({filter})
    .then(r => r.data),
  CERTBUND_CREATED);

export const CertBundCreatedLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={CERTBUND_CREATED}
    filter={filter}
    load={certBundCreatedLoader}
    subscriptions={[
      'certbundadvs.timer',
      'certbundadvs.changed',
    ]}
  >
    {children}
  </Loader>
);

CertBundCreatedLoader.propTypes = loaderPropTypes;

export const certBundSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.certbundadvs.getSeverityAggregates({filter})
    .then(r => r.data),
  CERTBUND_SEVERITY_CLASS);

export const CertBundSeverityLoader = ({
  filter,
  children,
}) => (
  <Loader
    dataId={CERTBUND_SEVERITY_CLASS}
    filter={filter}
    load={certBundSeverityLoader}
    subscriptions={[
      'certbundadv.timer',
      'certbundadv.changed',
    ]}
  >
    {children}
  </Loader>
);

CertBundSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
