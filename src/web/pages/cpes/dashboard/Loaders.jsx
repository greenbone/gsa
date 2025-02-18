/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const CPES_CREATED = 'cpes-created';
export const CPES_SEVERITY = 'cpes-severity';

export const cpeCreatedLoader = loadFunc(
  ({gmp, filter}) => gmp.cpes.getCreatedAggregates({filter}).then(r => r.data),
  CPES_CREATED,
);

export const CpesCreatedLoader = ({filter, children}) => (
  <Loader
    dataId={CPES_CREATED}
    filter={filter}
    load={cpeCreatedLoader}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);

CpesCreatedLoader.propTypes = loaderPropTypes;

export const cpeSeverityLoader = loadFunc(
  ({gmp, filter}) => gmp.cpes.getSeverityAggregates({filter}).then(r => r.data),
  CPES_SEVERITY,
);

export const CpesSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={CPES_SEVERITY}
    filter={filter}
    load={cpeSeverityLoader}
    subscriptions={['cpes.timer', 'cpes.changed']}
  >
    {children}
  </Loader>
);

CpesSeverityLoader.propTypes = loaderPropTypes;
