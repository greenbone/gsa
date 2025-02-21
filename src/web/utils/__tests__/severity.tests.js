/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';

import {
  severityRiskFactor,
  severityRiskFactorToValue,
  extraRiskFactor,
  resultSeverityRiskFactor,
  translateRiskFactor,
  translatedResultSeverityRiskFactor,
  getSeverityLevels,
  getSeverityLevelsOld,
  CRITICAL,
  HIGH,
  MEDIUM,
  LOW,
  LOG,
  FALSE_POSITIVE,
  ERROR,
  DEBUG,
  NA,
  CRITICAL_VALUE,
  HIGH_VALUE,
  MEDIUM_VALUE,
  LOW_VALUE,
  LOG_VALUE,
  FALSE_POSITIVE_VALUE,
  DEBUG_VALUE,
  ERROR_VALUE,
  NA_VALUE,
} from '../severity';

describe('Severity', () => {
  describe('severityRiskFactor', () => {
    test('should return the correct severity risk factor', () => {
      expect(severityRiskFactor(0)).toBe(LOG);
      expect(severityRiskFactor(1)).toBe(LOW);
      expect(severityRiskFactor(4)).toBe(MEDIUM);
      expect(severityRiskFactor(7)).toBe(HIGH);
      expect(severityRiskFactor(9)).toBe(CRITICAL);
      expect(severityRiskFactor(10)).toBe(CRITICAL);
      expect(severityRiskFactor(-1)).toBe(NA);
    });
  });

  describe('severityRiskFactorToValue', () => {
    test('should return the correct value for a given severity risk factor', () => {
      expect(severityRiskFactorToValue(CRITICAL)).toBe(CRITICAL_VALUE);
      expect(severityRiskFactorToValue(HIGH)).toBe(HIGH_VALUE);
      expect(severityRiskFactorToValue(MEDIUM)).toBe(MEDIUM_VALUE);
      expect(severityRiskFactorToValue(LOW)).toBe(LOW_VALUE);
      expect(severityRiskFactorToValue(LOG)).toBe(LOG_VALUE);
      expect(severityRiskFactorToValue(FALSE_POSITIVE)).toBe(
        FALSE_POSITIVE_VALUE,
      );
    });
  });

  describe('extraRiskFactor', () => {
    test('should return the correct extra risk factor', () => {
      expect(extraRiskFactor(LOG_VALUE)).toBe(LOG);
      expect(extraRiskFactor(FALSE_POSITIVE_VALUE)).toBe(FALSE_POSITIVE);
      expect(extraRiskFactor(DEBUG_VALUE)).toBe(DEBUG);
      expect(extraRiskFactor(ERROR_VALUE)).toBe(ERROR);
      expect(extraRiskFactor(NA_VALUE)).toBe(NA);
      expect(extraRiskFactor(100)).toBe(100);
    });
  });

  describe('resultSeverityRiskFactor', () => {
    test('should return the correct result severity risk factor', () => {
      expect(resultSeverityRiskFactor(0)).toBe(LOG);
      expect(resultSeverityRiskFactor(1)).toBe(LOW);
      expect(resultSeverityRiskFactor(4)).toBe(MEDIUM);
      expect(resultSeverityRiskFactor(7)).toBe(HIGH);
      expect(resultSeverityRiskFactor(9)).toBe(CRITICAL);
      expect(resultSeverityRiskFactor(-1)).toBe(FALSE_POSITIVE);
      expect(resultSeverityRiskFactor(-2)).toBe(DEBUG);
      expect(resultSeverityRiskFactor(-3)).toBe(ERROR);
      expect(resultSeverityRiskFactor(-99)).toBe(NA);
    });
  });

  describe('translateRiskFactor', () => {
    test('should return the translated risk factor', () => {
      expect(translateRiskFactor(CRITICAL)).toBe('Critical');
      expect(translateRiskFactor(HIGH)).toBe('High');
      expect(translateRiskFactor(MEDIUM)).toBe('Medium');
      expect(translateRiskFactor(LOW)).toBe('Low');
      expect(translateRiskFactor(LOG)).toBe('Log');
      expect(translateRiskFactor(FALSE_POSITIVE)).toBe('False Positive');
      expect(translateRiskFactor(ERROR)).toBe('Error');
      expect(translateRiskFactor(DEBUG)).toBe('Debug');
      expect(translateRiskFactor(NA)).toBe('N/A');
    });
  });

  describe('translatedResultSeverityRiskFactor', () => {
    test('should return the translated result severity risk factor', () => {
      expect(translatedResultSeverityRiskFactor(0)).toBe('Log');
      expect(translatedResultSeverityRiskFactor(1)).toBe('Low');
      expect(translatedResultSeverityRiskFactor(4)).toBe('Medium');
      expect(translatedResultSeverityRiskFactor(7)).toBe('High');
      expect(translatedResultSeverityRiskFactor(9)).toBe('Critical');
      expect(translatedResultSeverityRiskFactor(-1)).toBe('False Positive');
      expect(translatedResultSeverityRiskFactor(-2)).toBe('Debug');
      expect(translatedResultSeverityRiskFactor(-3)).toBe('Error');
      expect(translatedResultSeverityRiskFactor(-99)).toBe('N/A');
    });
  });

  describe('getSeverityLevels', () => {
    test('should return the correct severity levels', () => {
      const levels = getSeverityLevels();
      expect(levels).toEqual({
        critical: 9.0,
        high: 7.0,
        medium: 4.0,
        low: 0.1,
      });
    });
  });

  describe('getSeverityLevelsOld', () => {
    test('should return the correct old severity levels', () => {
      const levels = getSeverityLevelsOld();
      expect(levels).toEqual({
        max_high: 10.0,
        min_high: 7.0,
        max_medium: 6.9,
        min_medium: 4.0,
        max_low: 3.9,
        min_low: 0.1,
        max_log: 0.0,
      });
    });
  });
});
