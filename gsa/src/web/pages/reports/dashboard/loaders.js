/* Copyright (C) 2018-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import Loader, {
  loadFunc,
  loaderPropTypes,
} from 'web/store/dashboard/data/loader';

export const REPORTS_HIGH_RESULTS = 'reports-high-results';
export const REPORTS_SEVERITY = 'reports-severity';

export const reportsSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.reports.getSeverityAggregates({filter}).then(r => r.data),
  REPORTS_SEVERITY,
);

export const ReportsSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={REPORTS_SEVERITY}
    filter={filter}
    load={reportsSeverityLoader}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

ReportsSeverityLoader.propTypes = loaderPropTypes;

export const reportsHighResultsLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.reports.getHighResultsAggregates({filter}).then(r => r.data),
  REPORTS_HIGH_RESULTS,
);

export const ReportsHighResultsLoader = ({filter, children}) => (
  <Loader
    dataId={REPORTS_HIGH_RESULTS}
    filter={filter}
    load={reportsHighResultsLoader}
    subscriptions={['reports.timer', 'reports.changed']}
  >
    {children}
  </Loader>
);

ReportsHighResultsLoader.propTypes = loaderPropTypes;

// vim: set ts=2 sw=2 tw=80:
