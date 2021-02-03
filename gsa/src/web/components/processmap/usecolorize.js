/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {useSelector} from 'react-redux';

import {isDefined} from 'gmp/utils/identity';

import {hostsFilter} from 'web/components/processmap/processmaploader';

import {selector as hostSelector} from 'web/store/entities/hosts';

import {
  severityRiskFactor,
  LOG,
  LOG_VALUE,
  LOW,
  MEDIUM,
  NA_VALUE,
  HIGH,
} from 'web/utils/severity';
import Theme from 'web/utils/theme';

const LOCAL_NA_VALUE = -5;

const getMaxSeverity = (hostEntities = []) => {
  const severities = [];
  for (const host of hostEntities) {
    // only take "numerical" severities into account and ignore e.g. "N/A"
    if (host.severity >= 0) {
      severities.push(host.severity);
    }
  }
  let sev = Math.max(...severities);
  // if there are hosts but all of them have "non-numerical" severities
  if (hostEntities.length > 0 && severities.length === 0) {
    sev = LOCAL_NA_VALUE;
  }
  if (sev === -Infinity) {
    // when Math.max got an empty severities array
    sev = NA_VALUE;
  }

  return sev;
};

const getSeverityColor = severity => {
  const riskFactor = severityRiskFactor(severity);
  let color;
  if (riskFactor === LOG) {
    color = Theme.lightGray;
  } else if (riskFactor === MEDIUM) {
    color = Theme.severityWarnYellow;
  } else if (riskFactor === HIGH) {
    color = Theme.errorRed;
  } else if (riskFactor === LOW) {
    color = Theme.severityLowBlue;
  } else if (severity === NA_VALUE) {
    color = Theme.white;
  } else {
    color = Theme.mediumGray;
  }
  return color;
};

const useColorize = (processMap = {}, applyConditionalColorization) => {
  let hostFilter;
  const procMap = {...processMap};
  const {processes = {}, edges = {}} = procMap;
  useSelector(rootState => {
    // get the initial severities and colors for processes
    for (const procId in processes) {
      const {tagId} = processes[procId];
      hostFilter = hostsFilter(tagId);
      const hostSel = hostSelector(rootState);
      const hostEntities = hostSel.getEntities(hostFilter);
      const isLoadingHosts = hostSel.isLoadingEntities(hostFilter);
      const maxSeverity = getMaxSeverity(hostEntities);
      if (!isLoadingHosts) {
        procMap.processes[procId].color = getSeverityColor(maxSeverity);
        procMap.processes[procId].severity = maxSeverity;
        procMap.processes[procId].derivedSeverity = maxSeverity;
      }
    }
    if (applyConditionalColorization) {
      let updated = true;
      // loop through edges until no more processes received an update
      while (updated) {
        updated = false;
        for (const edge of Object.values(edges)) {
          const {source: sourceId, target: targetId} = edge;
          const source = procMap.processes[sourceId];
          const target = procMap.processes[targetId];

          if (
            (source.derivedSeverity > target.derivedSeverity &&
              source.derivedSeverity !== LOG_VALUE) ||
            !isDefined(target.derivedSeverity)
          ) {
            // if source.derivedSeverity is not LOG
            procMap.processes[targetId].color = getSeverityColor(
              source.derivedSeverity,
            );
            procMap.processes[targetId].derivedSeverity =
              source.derivedSeverity;
            updated = true;
          }
        }
      }
    }
  });

  return procMap;
};

export default useColorize;

// vim: set ts=2 sw=2 tw=80:
