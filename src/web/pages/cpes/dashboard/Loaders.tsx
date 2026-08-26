/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const CPES_CREATED = 'cpes-created';
export const CPES_SEVERITY = 'cpes-severity';

export const cpeCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cpes.getCreatedAggregates({filter}).then(r => r.data),
  CPES_CREATED,
);

export const CpesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CPES_CREATED}
    filter={filter}
    load={cpeCreatedLoadFunc}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);

export const cpeSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cpes.getSeverityAggregates({filter}).then(r => r.data),
  CPES_SEVERITY,
);

export const CpesSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CPES_SEVERITY}
    filter={filter}
    load={cpeSeverityLoadFunc}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);
