/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type CreatedData} from 'web/components/dashboard/display/created/created-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import type {SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

export const CERTBUNDS_SEVERITY = 'certbunds-severity';
export const CERTBUNDS_CREATED = 'certbunds-created';

const certBundCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.certbunds.getCreatedAggregates({filter}).then(r => r.data),
  CERTBUNDS_CREATED,
);

export const CertBundCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={CERTBUNDS_CREATED}
    filter={filter}
    load={certBundCreatedLoadFunc}
    subscriptions={['certbunds.timer', 'certbunds.changed']}
  >
    {children}
  </Loader>
);

const certBundSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) =>
    gmp.certbunds.getSeverityAggregates({filter}).then(r => r.data),
  CERTBUNDS_SEVERITY,
);

export const CertBundSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={CERTBUNDS_SEVERITY}
    filter={filter}
    load={certBundSeverityLoadFunc}
    subscriptions={['certbunds.timer', 'certbunds.changed']}
  >
    {children}
  </Loader>
);
