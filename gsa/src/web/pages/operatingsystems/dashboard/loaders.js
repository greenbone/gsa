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

export const OSS_SEVERITY = 'oss-severity';
export const OSS_VULN_SCORE = 'oss-most-vulnerable';
const OSS_MAX_GROUPS = 10;

export const osAverageSeverityLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.operatingsystems
      .getAverageSeverityAggregates({filter})
      .then(r => r.data),
  OSS_SEVERITY,
);

export const OsAverageSeverityLoader = ({filter, children}) => (
  <Loader
    dataId={OSS_SEVERITY}
    filter={filter}
    load={osAverageSeverityLoader}
    subscriptions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);

OsAverageSeverityLoader.propTypes = loaderPropTypes;

export const osVulnScoreLoader = loadFunc(
  ({gmp, filter}) =>
    gmp.operatingsystems
      .getVulnScoreAggregates({filter, max: OSS_MAX_GROUPS})
      .then(r => r.data),
  OSS_VULN_SCORE,
);

export const OsVulnScoreLoader = ({children, filter}) => (
  <Loader
    dataId={OSS_VULN_SCORE}
    filter={filter}
    load={osVulnScoreLoader}
    subscripions={['operatingsystems.timer', 'operatingsystems.changed']}
  >
    {children}
  </Loader>
);

OsVulnScoreLoader.propTypes = loaderPropTypes;
