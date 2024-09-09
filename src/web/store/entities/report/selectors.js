/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
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

export const auditReportSelector = rootState =>
  new ReportSelector(rootState.entities.auditreport);

export const deltaReportSelector = rootState =>
  new DeltaReportSelector(rootState.entities.deltaReport);

export const deltaAuditReportSelector = rootState =>
  new DeltaReportSelector(rootState.entities.deltaAuditReport);
