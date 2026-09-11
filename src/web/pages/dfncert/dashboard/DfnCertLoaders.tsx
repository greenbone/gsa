/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CreatedData} from 'web/components/dashboard/display/created/created-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import {type SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

export const DFNCERTS_CREATED = 'dfncerts-created';
export const DFNCERTS_SEVERITY = 'dfncerts-severity';

const dfnCertsCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.dfncerts.getCreatedAggregates({filter}).then(r => r.data),
  DFNCERTS_CREATED,
);

export const DfnCertsCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={DFNCERTS_CREATED}
    filter={filter}
    load={dfnCertsCreatedLoadFunc}
    subscriptions={['dfncerts.timer', 'dfncerts.changed']}
  >
    {children}
  </Loader>
);

const dfnCertSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.dfncerts.getSeverityAggregates({filter}).then(r => r.data),
  DFNCERTS_SEVERITY,
);

export const DfnCertSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={DFNCERTS_SEVERITY}
    filter={filter}
    load={dfnCertSeverityLoadFunc}
    subscriptions={['dfncerts.timer', 'dfncerts.changed']}
  >
    {children}
  </Loader>
);
