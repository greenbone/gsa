/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const DFNCERTS_CREATED = 'dfncerts-created';
export const DFNCERTS_SEVERITY = 'dfncerts-severity';

export const dfnCertsCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.dfncerts.getCreatedAggregates({filter}).then(r => r.data),
  DFNCERTS_CREATED,
);

export const DfnCertsCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={DFNCERTS_CREATED}
    filter={filter}
    load={dfnCertsCreatedLoadFunc}
    subscriptions={['dfncerts.timer', 'dfncerts.changed']}
  >
    {children}
  </Loader>
);

export const dfnCertSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.dfncerts.getSeverityAggregates({filter}).then(r => r.data),
  DFNCERTS_SEVERITY,
);

export const DfnCertSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={DFNCERTS_SEVERITY}
    filter={filter}
    load={dfnCertSeverityLoadFunc}
    subscriptions={['dfncerts.timer', 'dfncerts.changed']}
  >
    {children}
  </Loader>
);
