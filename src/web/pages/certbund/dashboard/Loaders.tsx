/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const CERTBUNDS_SEVERITY = 'certbunds-severity';
export const CERTBUNDS_CREATED = 'certbunds-created';

export const certBundCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.certbunds.getCreatedAggregates({filter}).then(r => r.data),
  CERTBUNDS_CREATED,
);

export const CertBundCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CERTBUNDS_CREATED}
    filter={filter}
    load={certBundCreatedLoadFunc}
    subscriptions={['certbunds.timer', 'certbunds.changed']}
  >
    {children}
  </Loader>
);

export const certBundSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.certbunds.getSeverityAggregates({filter}).then(r => r.data),
  CERTBUNDS_SEVERITY,
);

export const CertBundSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CERTBUNDS_SEVERITY}
    filter={filter}
    load={certBundSeverityLoadFunc}
    subscriptions={['certbunds.timer', 'certbunds.changed']}
  >
    {children}
  </Loader>
);
