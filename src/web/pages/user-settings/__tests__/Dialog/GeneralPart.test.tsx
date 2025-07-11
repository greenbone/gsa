/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {DATE_TIME_FORMAT_OPTIONS, DATE_TIME_CATEGORY} from 'gmp/locale/date';
import {NO_VALUE, YES_VALUE} from 'gmp/parser';
import GeneralPart, {
  renderLanguageItems,
  getSelectItems,
} from 'web/pages/user-settings/Dialog/GeneralPart';

describe('GeneralPart', () => {
  describe('renderLanguageItems', () => {
    test('should return language items with correct structure', () => {
      const items = renderLanguageItems();
      const result = [
        {value: 'de', label: 'German | Deutsch'},
        {value: 'en', label: 'English | English'},
        {value: 'zh_TW', label: 'Traditional Chinese | 繁體中文'},
        {value: 'Browser Language', label: 'Browser Language'},
      ];
      expect(items).toEqual(result);
    });
  });

  describe('form fields', () => {
    const props = {
      timezone: 'Europe/Berlin',
      userInterfaceDateFormat: DATE_TIME_FORMAT_OPTIONS.WDMY,
      userInterfaceTimeFormat: DATE_TIME_FORMAT_OPTIONS.TIME_24,
      isUserInterfaceTimeDateDefault: NO_VALUE,
      oldPassword: '',
      newPassword: '',
      confPassword: '',
      userInterfaceLanguage: 'en',
      rowsPerPage: 10,
      detailsExportFileName: 'details',
      listExportFileName: 'list',
      reportExportFileName: 'report',
      autoCacheRebuild: NO_VALUE,
      shouldWarn: false,
      errors: {},
      onChange: testing.fn(),
    };

    const labels = [
      'Timezone',
      'Use System Default for Time and Date Format',
      'Time Format',
      'Date Format',
      'Change Password',
      'Old',
      'New',
      'Confirm',
      'User Interface Language',
      'Rows Per Page',
      'Details Export File Name',
      'List Export File Name',
      'Report Export File Name',
      'Auto Cache Rebuild',
    ];

    test('renders all general part labels and fields', () => {
      render(<GeneralPart {...props} />);
      labels.forEach(label => {
        expect(screen.getByText(label)).toBeVisible();
      });

      const selects = screen.getAllByTestId('form-select');
      expect(selects.length).toBeGreaterThanOrEqual(4);
      selects.forEach(select => {
        expect(select).toBeVisible();
      });

      expect(screen.getByLabelText('Old')).toBeVisible();
      expect(screen.getByLabelText('New')).toBeVisible();
      expect(screen.getByLabelText('Confirm')).toBeVisible();

      const textBoxes = screen.getAllByRole('textbox');
      expect(textBoxes.length).toBeGreaterThanOrEqual(4);
      expect(screen.getByDisplayValue('10')).toBeVisible();
      expect(screen.getByDisplayValue('details')).toBeVisible();
      expect(screen.getByDisplayValue('list')).toBeVisible();
      expect(screen.getByDisplayValue('report')).toBeVisible();

      expect(
        screen.getByRole('checkbox', {name: /system default/i}),
      ).toBeVisible();
      expect(
        screen.getByRole('checkbox', {name: /auto cache rebuild/i}),
      ).toBeVisible();
    });

    test('Time/Date Format selects are disabled when checkbox is checked', () => {
      const checkedProps = {
        ...props,
        isUserInterfaceTimeDateDefault: YES_VALUE,
      };
      render(<GeneralPart {...checkedProps} />);
      const selects = screen.getAllByTestId('form-select');
      expect(selects[1]).toBeDisabled();
      expect(selects[2]).toBeDisabled();
    });

    test('Time/Date Format selects are enabled when checkbox is not checked', () => {
      const uncheckedProps = {
        ...props,
        isUserInterfaceTimeDateDefault: NO_VALUE,
      };
      render(<GeneralPart {...uncheckedProps} />);
      const selects = screen.getAllByTestId('form-select');
      expect(selects[1]).not.toBeDisabled();
      expect(selects[2]).not.toBeDisabled();
    });
  });

  describe('getSelectItems', () => {
    const fakeT = (s: string) => s;
    test('returns correct items for TIME', () => {
      expect(getSelectItems(DATE_TIME_CATEGORY.TIME, fakeT)).toEqual([
        {value: DATE_TIME_FORMAT_OPTIONS.TIME_12, label: '12h'},
        {value: DATE_TIME_FORMAT_OPTIONS.TIME_24, label: '24h'},
      ]);
    });
    test('returns correct items for LONG_DATE', () => {
      expect(getSelectItems(DATE_TIME_CATEGORY.LONG_DATE, fakeT)).toEqual([
        {
          value: DATE_TIME_FORMAT_OPTIONS.WMDY,
          label: 'Weekday, Month, Day, Year',
        },
        {
          value: DATE_TIME_FORMAT_OPTIONS.WDMY,
          label: 'Weekday, Day, Month, Year',
        },
      ]);
    });
  });
});
