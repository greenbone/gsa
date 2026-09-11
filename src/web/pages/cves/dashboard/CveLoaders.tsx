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

export const CVES_SEVERITY = 'cves-severity';
export const CVES_CREATED = 'cves-created';

const cveCreatedLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cves.getCreatedAggregates({filter}).then(r => r.data),
  CVES_CREATED,
);

export const CvesCreatedLoader = ({
  filter,
  children,
}: DisplayLoaderProps<CreatedData>) => (
  <Loader
    dataId={CVES_CREATED}
    filter={filter}
    load={cveCreatedLoadFunc}
    subscriptions={['cves.timer', 'cves.changed']}
  >
    {children}
  </Loader>
);

const cveSeverityLoadFunc = createLoadFunc(
  ({gmp, filter}) => gmp.cves.getSeverityAggregates({filter}).then(r => r.data),
  CVES_SEVERITY,
);

export const CvesSeverityLoader = ({
  filter,
  children,
}: DisplayLoaderProps<SeverityData>) => (
  <Loader
    dataId={CVES_SEVERITY}
    filter={filter}
    load={cveSeverityLoadFunc}
    subscriptions={['cves.timer', 'cves.changed']}
  >
    {children}
  </Loader>
);
