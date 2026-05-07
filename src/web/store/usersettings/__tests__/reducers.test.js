/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {getReportComposerDefaultsAction} from 'web/store/usersettings/actions';
import {reportComposerDefaults} from 'web/store/usersettings/reducers';

describe('settings reducers tests', () => {
  describe('reportComposerDefaults reducer tests', () => {
    test('should create initial empty state', () => {
      expect(reportComposerDefaults(undefined, {})).toEqual({});
    });

    test('should reduce reportComposerDefaults success action', () => {
      const action = getReportComposerDefaultsAction({foo: 'bar'});
      expect(reportComposerDefaults(undefined, action)).toEqual({foo: 'bar'});
    });

    test('should merge existing defaults', () => {
      const action = getReportComposerDefaultsAction({foo: 'bar'});
      const state = {
        foo: 'ipsum',
        toBe: 'preserved',
      };
      const res = {
        foo: 'bar',
        toBe: 'preserved',
      };
      expect(reportComposerDefaults(state, action)).toEqual(res);
    });
  });
});
