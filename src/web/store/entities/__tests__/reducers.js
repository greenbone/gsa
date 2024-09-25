/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {isFunction} from 'gmp/utils/identity';

import entitiesReducer from '../reducers';

const initState = {
  byId: {},
  errors: {},
  isLoading: {},
};

describe('entities reducer tests', () => {
  test('should be a function', () => {
    expect(isFunction(entitiesReducer)).toEqual(true);
  });

  test('should create initial state', () => {
    expect(entitiesReducer(undefined, {})).toEqual({
      alert: initState,
      audit: initState,
      auditreport: initState,
      certbund: initState,
      cpe: initState,
      credential: initState,
      cve: initState,
      deltaAuditReport: initState,
      deltaReport: initState,
      dfncert: initState,
      filter: initState,
      group: initState,
      host: initState,
      note: initState,
      nvt: initState,
      operatingsystem: initState,
      override: initState,
      permission: initState,
      policy: initState,
      portlist: initState,
      reportconfig: initState,
      reportformat: initState,
      report: initState,
      result: initState,
      role: initState,
      scanconfig: initState,
      scanner: initState,
      schedule: initState,
      tag: initState,
      target: initState,
      task: initState,
      ticket: initState,
      tlscertificate: initState,
      user: initState,
      vuln: initState,
    });
  });
});

// vim: set ts=2 sw=2 tw=80:
