/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {getReportComposerDefaults} from 'web/store/usersettings/selectors';

const createRootState = state => ({
  userSettings: state,
});

describe('settings selectors tests', () => {
  describe('getReportComposerDefaults tests', () => {
    test('should return undefined reportComposerDefaults for empty state', () => {
      const state = createRootState({});
      expect(getReportComposerDefaults(state)).toBeUndefined();
    });

    test('should return reportComposerDefaults', () => {
      const state = createRootState({reportComposerDefaults: {foo: 'bar'}});
      expect(getReportComposerDefaults(state)).toEqual({foo: 'bar'});
    });
  });
});
