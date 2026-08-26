/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import Loader, {createLoadFunc} from 'web/components/dashboard/display/Loader';

export const CVES_SEVERITY = 'cves-severity';
export const CVES_CREATED = 'cves-created';

export const cveCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cves.getCreatedAggregates({filter}).then(r => r.data),
  CVES_CREATED,
);

export const CvesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CVES_CREATED}
    filter={filter}
    load={cveCreatedLoadFunc}
    subscriptions={['cves.timer', 'cves.changed']}
  >
    {children}
  </Loader>
);

export const cveSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cves.getSeverityAggregates({filter}).then(r => r.data),
  CVES_SEVERITY,
);

export const CvesSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CVES_SEVERITY}
    filter={filter}
    load={cveSeverityLoadFunc}
    subscriptions={['cves.timer', 'cves.changed']}
  >
    {children}
  </Loader>
);
