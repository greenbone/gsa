/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {isFunction} from 'gmp/utils/identity';
import {
  getReportComposerDefaultsAction,
  loadReportComposerDefaults,
  saveReportComposerDefaults,
  USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
} from 'web/store/usersettings/actions';

describe('settings actions tests', () => {
  test('should create report composer defaults loading success action', () => {
    const action = getReportComposerDefaultsAction({foo: 'bar'});
    expect(action).toEqual({
      type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
      data: {foo: 'bar'},
    });
  });

  describe('loadReportComposerDefaults tests', () => {
    test('should dispatch success actions', () => {
      const dispatch = testing.fn();

      const data = {foo: 'bar'};
      const getReportComposerDefaults = testing
        .fn()
        .mockReturnValue(Promise.resolve({data}));

      const gmp = {
        user: {
          getReportComposerDefaults,
        },
      };

      expect(isFunction(loadReportComposerDefaults)).toBe(true);

      return loadReportComposerDefaults(gmp)()(dispatch).then(() => {
        expect(getReportComposerDefaults).toBeCalled();
        expect(dispatch).toHaveBeenCalledWith({
          type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
          data,
        });
      });
    });
  });

  describe('saveReportComposerDefaults tests', () => {
    test('should dispatch success actions', () => {
      const dispatch = testing.fn();

      const data = {foo: 'bar'};
      const saveReportComposerDefaultsMock = testing
        .fn()
        .mockReturnValue(Promise.resolve({data}));

      const gmp = {
        user: {
          saveReportComposerDefaults: saveReportComposerDefaultsMock,
        },
      };

      const defaults = {fake: 'someDefaults'};

      expect(isFunction(saveReportComposerDefaults)).toBe(true);

      return saveReportComposerDefaults(gmp)(defaults)(dispatch).then(() => {
        expect(saveReportComposerDefaultsMock).toHaveBeenCalledWith(defaults);
        expect(dispatch).toHaveBeenCalledWith({
          type: USER_SETTINGS_LOAD_REPORT_COMPOSER_DEFAULTS_SUCCESS,
          data: defaults,
        });
      });
    });
  });
});
