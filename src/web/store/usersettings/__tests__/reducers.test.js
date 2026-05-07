/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {
  getReportComposerDefaultsAction,
  setLocale,
} from 'web/store/usersettings/actions';
import {locale, reportComposerDefaults} from 'web/store/usersettings/reducers';

describe('settings reducers tests', () => {
  describe('locale reducer tests', () => {
    test('should create initial state', () => {
      expect(locale(undefined, {})).toBeUndefined();
    });

    test('should reduce locale action', () => {
      const action = setLocale('de');
      expect(locale(undefined, action)).toEqual('de');
    });

    test('should override locale in state', () => {
      const action = setLocale('de');
      expect(locale('foo', action)).toEqual('de');
    });
  });

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
