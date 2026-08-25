/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {COMPLIANCE} from 'gmp/models/compliance';
import date from 'gmp/models/date';
import FilterTerm from 'gmp/models/filter/filter-term';
import QueryFilter from 'gmp/models/filter/query-filter';
import {
  activeDaysColorScale,
  complianceColorScale,
  createDateRangeFilter,
  percent,
  QOD_TYPES,
  qodColorScale,
  qodTypeColorScale,
  randomColor,
  riskFactorColorScale,
  SEC_INFO_TYPES,
  secInfoTypeColorScale,
  totalCount,
  vulnsByHostsColorScale,
} from 'web/components/dashboard/display/utils';
import {
  CRITICAL,
  DEBUG,
  ERROR,
  FALSE_POSITIVE,
  HIGH,
  LOG,
  LOW,
  MEDIUM,
  NA,
} from 'web/utils/severity';
import Theme from 'web/utils/theme';

describe('display utils', () => {
  describe('createDateRangeFilter', () => {
    test('should add formatted start and end terms without mutating the filter', () => {
      const filter = QueryFilter.fromString('rows=10');

      const result = createDateRangeFilter({
        endDate: date('2024-01-16T12:00:00Z'),
        field: 'created',
        filter,
        formatDate: value => value.utc().format(),
        startDate: date('2024-01-15T12:00:00Z'),
      });

      expect(filter.toFilterString()).toBe('rows=10');
      expect(result).not.toBe(filter);
      expect(result.hasTerm(FilterTerm.fromString('rows=10'))).toBe(true);
      expect(
        result.hasTerm(FilterTerm.fromString('created>2024-01-15T12:00:00Z')),
      ).toBe(true);
      expect(
        result.hasTerm(FilterTerm.fromString('created<2024-01-16T12:00:00Z')),
      ).toBe(true);
    });

    test('should honor the supplied date formatter', () => {
      const startDate = date('2024-01-15T12:00:00Z');
      const endDate = date('2024-01-16T12:00:00Z');
      const formatDate = (value: typeof startDate) =>
        value.format('YYYY-MM-DDTHH:mm');

      const result = createDateRangeFilter({
        endDate,
        field: 'modified',
        formatDate,
        startDate,
      });

      expect(
        result.hasTerm(
          FilterTerm.fromString(`modified>${formatDate(startDate)}`),
        ),
      ).toBe(true);
      expect(
        result.hasTerm(
          FilterTerm.fromString(`modified<${formatDate(endDate)}`),
        ),
      ).toBe(true);
    });

    test('should expand a single selected date by one day', () => {
      const selectedDate = date('2024-01-15T12:00:00Z');
      const formatDate = (value: typeof selectedDate) =>
        value.format('YYYY-MM-DDTHH:mm');

      const result = createDateRangeFilter({
        endDate: selectedDate,
        field: 'modified',
        formatDate,
        startDate: selectedDate,
      });

      expect(
        result.hasTerm(
          FilterTerm.fromString(
            `modified>${formatDate(selectedDate.clone().subtract(1, 'day'))}`,
          ),
        ),
      ).toBe(true);
      expect(
        result.hasTerm(
          FilterTerm.fromString(
            `modified<${formatDate(selectedDate.clone().add(1, 'day'))}`,
          ),
        ),
      ).toBe(true);
    });

    test('should preserve existing date range terms', () => {
      const startDate = date('2024-01-15T12:00:00Z');
      const endDate = date('2024-01-16T12:00:00Z');
      const formatDate = (value: typeof startDate) =>
        value.format('YYYY-MM-DDTHH:mm');
      const filter = new QueryFilter({
        terms: [
          FilterTerm.fromString(`date>${formatDate(startDate)}`),
          FilterTerm.fromString(`date<${formatDate(endDate)}`),
        ],
      });

      const result = createDateRangeFilter({
        endDate,
        field: 'date',
        filter,
        formatDate,
        startDate,
      });

      expect(result.toFilterString()).toBe(filter.toFilterString());
    });
  });

  describe('totalCount', () => {
    test('should return 0 if groups is empty', () => {
      expect(totalCount([])).toBe(0);
    });

    test('should return the sum of counts in groups', () => {
      const groups = [{count: '1'}, {count: '2'}, {count: '3'}];
      expect(totalCount(groups)).toBe(6);
    });
  });

  describe('percent', () => {
    test('should return the correct percentage', () => {
      expect(percent(50, 200)).toBe('25.0');
      expect(percent('50', 200)).toBe('25.0');
    });

    test('should handle zero sum', () => {
      expect(percent('50', 0)).toBe('Infinity');
    });
  });

  describe('randomColor', () => {
    test('should return a valid hex color', () => {
      const color = randomColor();
      expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  describe('activeDaysColorScale', () => {
    test('should map known days to expected colors', () => {
      expect(activeDaysColorScale(1)).toBe('#01558e');
      expect(activeDaysColorScale(10)).toBe('#1b641b');
    });
  });

  describe('riskFactorColorScale', () => {
    test('should map risk factors to expected colors', () => {
      expect(riskFactorColorScale(ERROR)).toBe('#800000');
      expect(riskFactorColorScale(DEBUG)).toBe('#008080');
      expect(riskFactorColorScale(FALSE_POSITIVE)).toBe('#808080');
      expect(riskFactorColorScale(NA)).toBe('silver');
      expect(riskFactorColorScale(LOG)).toBe(Theme.severityClassLog);
      expect(riskFactorColorScale(LOW)).toBe(Theme.severityClassLow);
      expect(riskFactorColorScale(MEDIUM)).toBe(Theme.severityClassMedium);
      expect(riskFactorColorScale(HIGH)).toBe(Theme.severityClassHigh);
      expect(riskFactorColorScale(CRITICAL)).toBe(Theme.severityClassCritical);
    });
  });

  describe('vulnsByHostsColorScale', () => {
    test('should map range endpoints to expected colors', () => {
      expect(vulnsByHostsColorScale(0)).toBe('rgb(0, 134, 68)');
      expect(vulnsByHostsColorScale(1)).toBe('rgb(214, 57, 0)');
    });
  });

  describe('QOD_TYPES', () => {
    test('should contain expected keys', () => {
      expect(Object.keys(QOD_TYPES)).toEqual([
        '',
        'general_note',
        'executable_version',
        'package',
        'package_unreliable',
        'registry',
        'remote_active',
        'remote_analysis',
        'remote_app',
        'remote_banner',
        'remote_probe',
        'remote_banner_unreliable',
        'executable_version_unreliable',
        'remote_vul',
        'exploit',
      ]);
    });
  });

  describe('qodColorScale', () => {
    test('should map known qod values to expected colors', () => {
      expect(qodColorScale(1)).toBe('#011f4b');
      expect(qodColorScale(100)).toBe('#2ca02c');
    });
  });

  describe('qodTypeColorScale', () => {
    test('should map known qod types to expected colors', () => {
      expect(qodTypeColorScale('')).toBe('silver');
      expect(qodTypeColorScale('general_note')).toBe('#555555');
      expect(qodTypeColorScale('exploit')).toBe('#d62728');
    });
  });

  describe('SEC_INFO_TYPES', () => {
    test('should contain expected keys', () => {
      expect(Object.keys(SEC_INFO_TYPES)).toEqual([
        'cert_bund_adv',
        'cpe',
        'cve',
        'dfn_cert_adv',
        'nvt',
      ]);
    });
  });

  describe('secInfoTypeColorScale', () => {
    test('should map known security info types to expected colors', () => {
      expect(secInfoTypeColorScale('cert_bund_adv')).toBe('#011f4b');
      expect(secInfoTypeColorScale('cve')).toBe('#a9c9ce');
      expect(secInfoTypeColorScale('nvt')).toBe('#80c674');
    });
  });

  describe('complianceColorScale', () => {
    test('should map compliance values to expected colors', () => {
      expect(complianceColorScale(COMPLIANCE.YES)).toBe('#4cb045');
      expect(complianceColorScale(COMPLIANCE.NO)).toBe('#D80000');
      expect(complianceColorScale(COMPLIANCE.INCOMPLETE)).toBe('orange');
      expect(complianceColorScale(COMPLIANCE.UNDEFINED)).toBe('silver');
    });
  });
});
