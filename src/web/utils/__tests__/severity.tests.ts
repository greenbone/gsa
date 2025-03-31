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
  getSeverityLevelBoundaries,
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
  SEVERITY_RATING_CVSS_2,
  SEVERITY_RATING_CVSS_3,
} from 'web/utils/severity';

describe('Severity', () => {
  describe('severityRiskFactor', () => {
    test('should return the default severity risk factor', () => {
      expect(severityRiskFactor(0)).toBe(LOG);
      expect(severityRiskFactor(1)).toBe(LOW);
      expect(severityRiskFactor(4)).toBe(MEDIUM);
      expect(severityRiskFactor(7)).toBe(HIGH);
      expect(severityRiskFactor(9)).toBe(CRITICAL);
      expect(severityRiskFactor(10)).toBe(CRITICAL);
      expect(severityRiskFactor(-1)).toBe(NA);
    });

    test('should return the severity risk factor for CVSSv2', () => {
      expect(severityRiskFactor(0, SEVERITY_RATING_CVSS_2)).toBe(LOG);
      expect(severityRiskFactor(1, SEVERITY_RATING_CVSS_2)).toBe(LOW);
      expect(severityRiskFactor(4, SEVERITY_RATING_CVSS_2)).toBe(MEDIUM);
      expect(severityRiskFactor(7, SEVERITY_RATING_CVSS_2)).toBe(HIGH);
      expect(severityRiskFactor(9, SEVERITY_RATING_CVSS_2)).toBe(HIGH);
      expect(severityRiskFactor(10, SEVERITY_RATING_CVSS_2)).toBe(HIGH);
      expect(severityRiskFactor(-1, SEVERITY_RATING_CVSS_2)).toBe(NA);
    });

    test('should return the severity risk factor for CVSSv3', () => {
      expect(severityRiskFactor(0, SEVERITY_RATING_CVSS_3)).toBe(LOG);
      expect(severityRiskFactor(1, SEVERITY_RATING_CVSS_3)).toBe(LOW);
      expect(severityRiskFactor(4, SEVERITY_RATING_CVSS_3)).toBe(MEDIUM);
      expect(severityRiskFactor(7, SEVERITY_RATING_CVSS_3)).toBe(HIGH);
      expect(severityRiskFactor(9, SEVERITY_RATING_CVSS_3)).toBe(CRITICAL);
      expect(severityRiskFactor(10, SEVERITY_RATING_CVSS_3)).toBe(CRITICAL);
      expect(severityRiskFactor(-1, SEVERITY_RATING_CVSS_3)).toBe(NA);
    });
  });

  describe('severityRiskFactorToValue', () => {
    test('should return the default value for a given severity risk factor', () => {
      expect(severityRiskFactorToValue(CRITICAL)).toBe(CRITICAL_VALUE);
      expect(severityRiskFactorToValue(HIGH)).toBe(HIGH_VALUE);
      expect(severityRiskFactorToValue(MEDIUM)).toBe(MEDIUM_VALUE);
      expect(severityRiskFactorToValue(LOW)).toBe(LOW_VALUE);
      expect(severityRiskFactorToValue(LOG)).toBe(LOG_VALUE);
    });
  });

  describe('extraRiskFactor', () => {
    test('should return the extra risk factor', () => {
      expect(extraRiskFactor(LOG_VALUE)).toBe(LOG);
      expect(extraRiskFactor(FALSE_POSITIVE_VALUE)).toBe(FALSE_POSITIVE);
      expect(extraRiskFactor(DEBUG_VALUE)).toBe(DEBUG);
      expect(extraRiskFactor(ERROR_VALUE)).toBe(ERROR);
      expect(extraRiskFactor(NA_VALUE)).toBe(NA);
      expect(extraRiskFactor(100)).toBe(NA);
    });
  });

  describe('resultSeverityRiskFactor', () => {
    test('should return the default result severity risk factor', () => {
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

    test('should return the result severity risk factor for CVSSv2', () => {
      expect(resultSeverityRiskFactor(0, SEVERITY_RATING_CVSS_2)).toBe(LOG);
      expect(resultSeverityRiskFactor(1, SEVERITY_RATING_CVSS_2)).toBe(LOW);
      expect(resultSeverityRiskFactor(4, SEVERITY_RATING_CVSS_2)).toBe(MEDIUM);
      expect(resultSeverityRiskFactor(7, SEVERITY_RATING_CVSS_2)).toBe(HIGH);
      expect(resultSeverityRiskFactor(9, SEVERITY_RATING_CVSS_2)).toBe(HIGH);
      expect(resultSeverityRiskFactor(-1, SEVERITY_RATING_CVSS_2)).toBe(
        FALSE_POSITIVE,
      );
      expect(resultSeverityRiskFactor(-2, SEVERITY_RATING_CVSS_2)).toBe(DEBUG);
      expect(resultSeverityRiskFactor(-3, SEVERITY_RATING_CVSS_2)).toBe(ERROR);
      expect(resultSeverityRiskFactor(-99, SEVERITY_RATING_CVSS_2)).toBe(NA);
    });

    test('should return the result severity risk factor for CVSSv3', () => {
      expect(resultSeverityRiskFactor(0, SEVERITY_RATING_CVSS_3)).toBe(LOG);
      expect(resultSeverityRiskFactor(1, SEVERITY_RATING_CVSS_3)).toBe(LOW);
      expect(resultSeverityRiskFactor(4, SEVERITY_RATING_CVSS_3)).toBe(MEDIUM);
      expect(resultSeverityRiskFactor(7, SEVERITY_RATING_CVSS_3)).toBe(HIGH);
      expect(resultSeverityRiskFactor(9, SEVERITY_RATING_CVSS_3)).toBe(
        CRITICAL,
      );
      expect(resultSeverityRiskFactor(-1, SEVERITY_RATING_CVSS_3)).toBe(
        FALSE_POSITIVE,
      );
      expect(resultSeverityRiskFactor(-2, SEVERITY_RATING_CVSS_3)).toBe(DEBUG);
      expect(resultSeverityRiskFactor(-3, SEVERITY_RATING_CVSS_3)).toBe(ERROR);
      expect(resultSeverityRiskFactor(-99, SEVERITY_RATING_CVSS_3)).toBe(NA);
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
    test('should return the default translated result severity risk factor', () => {
      expect(translatedResultSeverityRiskFactor(0)).toBe('Log');
      expect(translatedResultSeverityRiskFactor(1)).toBe('Low');
      expect(translatedResultSeverityRiskFactor(4)).toBe('Medium');
      expect(translatedResultSeverityRiskFactor(7)).toBe('High');
      expect(translatedResultSeverityRiskFactor(9)).toBe('Critical');
      expect(translatedResultSeverityRiskFactor(10)).toBe('Critical');
      expect(translatedResultSeverityRiskFactor(-1)).toBe('False Positive');
      expect(translatedResultSeverityRiskFactor(-2)).toBe('Debug');
      expect(translatedResultSeverityRiskFactor(-3)).toBe('Error');
      expect(translatedResultSeverityRiskFactor(-99)).toBe('N/A');
    });

    test('should return the translated result severity risk factor for CVSSv2', () => {
      expect(
        translatedResultSeverityRiskFactor(0, SEVERITY_RATING_CVSS_2),
      ).toBe('Log');
      expect(
        translatedResultSeverityRiskFactor(1, SEVERITY_RATING_CVSS_2),
      ).toBe('Low');
      expect(
        translatedResultSeverityRiskFactor(4, SEVERITY_RATING_CVSS_2),
      ).toBe('Medium');
      expect(
        translatedResultSeverityRiskFactor(7, SEVERITY_RATING_CVSS_2),
      ).toBe('High');
      expect(
        translatedResultSeverityRiskFactor(9, SEVERITY_RATING_CVSS_2),
      ).toBe('High');
      expect(
        translatedResultSeverityRiskFactor(10, SEVERITY_RATING_CVSS_2),
      ).toBe('High');
      expect(
        translatedResultSeverityRiskFactor(-1, SEVERITY_RATING_CVSS_2),
      ).toBe('False Positive');
      expect(
        translatedResultSeverityRiskFactor(-2, SEVERITY_RATING_CVSS_2),
      ).toBe('Debug');
      expect(
        translatedResultSeverityRiskFactor(-3, SEVERITY_RATING_CVSS_2),
      ).toBe('Error');
      expect(
        translatedResultSeverityRiskFactor(-99, SEVERITY_RATING_CVSS_2),
      ).toBe('N/A');
    });

    test('should return the translated result severity risk factor for CVSSv3', () => {
      expect(
        translatedResultSeverityRiskFactor(0, SEVERITY_RATING_CVSS_3),
      ).toBe('Log');
      expect(
        translatedResultSeverityRiskFactor(1, SEVERITY_RATING_CVSS_3),
      ).toBe('Low');
      expect(
        translatedResultSeverityRiskFactor(4, SEVERITY_RATING_CVSS_3),
      ).toBe('Medium');
      expect(
        translatedResultSeverityRiskFactor(7, SEVERITY_RATING_CVSS_3),
      ).toBe('High');
      expect(
        translatedResultSeverityRiskFactor(9, SEVERITY_RATING_CVSS_3),
      ).toBe('Critical');
      expect(
        translatedResultSeverityRiskFactor(10, SEVERITY_RATING_CVSS_3),
      ).toBe('Critical');
      expect(
        translatedResultSeverityRiskFactor(-1, SEVERITY_RATING_CVSS_3),
      ).toBe('False Positive');
      expect(
        translatedResultSeverityRiskFactor(-2, SEVERITY_RATING_CVSS_3),
      ).toBe('Debug');
      expect(
        translatedResultSeverityRiskFactor(-3, SEVERITY_RATING_CVSS_3),
      ).toBe('Error');
      expect(
        translatedResultSeverityRiskFactor(-99, SEVERITY_RATING_CVSS_3),
      ).toBe('N/A');
    });
  });

  describe('getSeverityLevels', () => {
    test('should return the default severity levels', () => {
      const levels = getSeverityLevels();
      expect(levels).toEqual({
        critical: 9.0,
        high: 7.0,
        medium: 4.0,
        low: 0.1,
      });
    });

    test('should return the severity levels for CVSSv2', () => {
      const levels = getSeverityLevels(SEVERITY_RATING_CVSS_2);
      expect(levels).toEqual({
        high: 7.0,
        medium: 4.0,
        low: 0.1,
      });
    });

    test('should return the severity levels for CVSSv3', () => {
      const levels = getSeverityLevels(SEVERITY_RATING_CVSS_3);
      expect(levels).toEqual({
        critical: 9.0,
        high: 7.0,
        medium: 4.0,
        low: 0.1,
      });
    });
  });

  describe('getSeverityLevelBoundaries', () => {
    test('should return the default severity level boundaries', () => {
      const levels = getSeverityLevelBoundaries();
      expect(levels).toEqual({
        maxHigh: 10.0,
        minHigh: 7.0,
        maxMedium: 6.9,
        minMedium: 4.0,
        maxLow: 3.9,
        minLow: 0.1,
        maxLog: 0.0,
      });
    });

    test('should return the severity level boundaries for CVSSv2', () => {
      const levels = getSeverityLevelBoundaries(SEVERITY_RATING_CVSS_2);
      expect(levels).toEqual({
        maxHigh: 10.0,
        minHigh: 7.0,
        maxMedium: 6.9,
        minMedium: 4.0,
        maxLow: 3.9,
        minLow: 0.1,
        maxLog: 0.0,
      });
    });

    test('should return the severity level boundaries for CVSSv3', () => {
      const levels = getSeverityLevelBoundaries(SEVERITY_RATING_CVSS_3);
      expect(levels).toEqual({
        maxCritical: 10.0,
        minCritical: 9.0,
        maxHigh: 8.9,
        minHigh: 7.0,
        maxMedium: 6.9,
        minMedium: 4.0,
        maxLow: 3.9,
        minLow: 0.1,
        maxLog: 0.0,
      });
    });
  });
});
