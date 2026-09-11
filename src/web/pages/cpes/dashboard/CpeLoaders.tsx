/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type {CreatedData} from 'web/components/dashboard/display/created/created-transform';
import Loader, {
  createLoadFunc,
  type DisplayLoaderProps,
} from 'web/components/dashboard/display/Loader';
import type {SeverityData} from 'web/components/dashboard/display/severity/severity-class-transform';

export const CPES_CREATED = 'cpes-created';
export const CPES_SEVERITY = 'cpes-severity';

const cpeCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cpes.getCreatedAggregates({filter}).then(r => r.data),
  CPES_CREATED,
);

export const CpesCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={CPES_CREATED}
    filter={filter}
    load={cpeCreatedLoadFunc}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);

const cpeSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cpes.getSeverityAggregates({filter}).then(r => r.data),
  CPES_SEVERITY,
);

export const CpesSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={CPES_SEVERITY}
    filter={filter}
    load={cpeSeverityLoadFunc}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);
