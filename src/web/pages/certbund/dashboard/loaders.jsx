/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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
