/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const DFNCERTS_CREATED = 'dfncerts-created';
export const DFNCERTS_SEVERITY = 'dfncerts-severity';

export const dfnCertsCreatedLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.dfncerts.getCreatedAggregates({filter}).then(r => r.data),
  DFNCERTS_CREATED,
);

export const DfnCertsCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={DFNCERTS_CREATED}
    filter={filter}
    load={dfnCertsCreatedLoader}
    subscriptions={['dfncerts.timer', 'dfncerts.changed']}
  >
    {children}
  </Loader>
);

DfnCertsCreatedLoader.propTypes = loaderPropTypes;

export const dfnCertSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.dfncerts.getSeverityAggregates({filter}).then(r => r.data),
  DFNCERTS_SEVERITY,
);

export const DfnCertSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={DFNCERTS_SEVERITY}
    filter={filter}
    load={dfnCertSeverityLoader}
    subscriptions={['dfncerts.timer', 'dfncerts.changed']}
  >
    {children}
  </Loader>
);

DfnCertSeverityLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
