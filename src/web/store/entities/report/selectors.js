/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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
import {isDefined} from 'gmp/utils/identity';

export const simplifiedReportIdentifier = (reportId, filter) => {
  if (isDefined(filter)) {
    const filterString = filter.simple().toFilterString();
    if (filterString.trim().length > 0) {
      return `${reportId}-${filterString}`;
    }
  }
  return reportId;
};

export const reportIdentifier = (reportId, filter) => {
  if (isDefined(filter)) {
    const filterString = filter.toFilterString();
    if (filterString.trim().length > 0) {
      return `${reportId}-${filterString}`;
    }
  }
  return reportId;
};

class ReportSelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoadingEntity(id, filter) {
    return isDefined(this.state.isLoading)
      ? this.state.isLoading[reportIdentifier(id, filter)]
      : undefined;
  }

  getEntityError(id, filter) {
    return isDefined(this.state.errors)
      ? this.state.errors[reportIdentifier(id, filter)]
      : undefined;
  }

  getEntity(id, filter) {
    return isDefined(this.state.byId)
      ? this.state.byId[simplifiedReportIdentifier(id, filter)]
      : undefined;
  }
}

export const deltaReportIdentifier = (id, deltaId) => `${id}+${deltaId}`;

class DeltaReportSelector {
  constructor(state = {}) {
    this.state = state;
  }

  isLoading(id, deltaId) {
    return isDefined(this.state.isLoading)
      ? !!this.state.isLoading[deltaReportIdentifier(id, deltaId)]
      : false;
  }

  getError(id, deltaId) {
    return isDefined(this.state.errors)
      ? this.state.errors[deltaReportIdentifier(id, deltaId)]
      : undefined;
  }

  getEntity(id, deltaId) {
    return isDefined(this.state.byId)
      ? this.state.byId[deltaReportIdentifier(id, deltaId)]
      : undefined;
  }
}

export const reportSelector = rootState =>
  new ReportSelector(rootState.entities.report);

export const deltaReportSelector = rootState =>
  new DeltaReportSelector(rootState.entities.deltaReport);
