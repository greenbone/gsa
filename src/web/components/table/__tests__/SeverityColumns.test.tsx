/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {render, screen} from 'web/testing';
import {
  getComplianceColumnsConfig,
  getSeverityColumnsConfig,
  getSeverityLabel,
} from 'web/components/table/SeverityColumns';

describe('SeverityColumns', () => {
  describe('getSeverityLabel', () => {
    test.each([
      ['critical', 'Critical'],
      ['high', 'High'],
      ['medium', 'Medium'],
      ['low', 'Low'],
      ['log', 'Log'],
      ['false_positive', 'False Pos.'],
    ])('should return %s label for %s key', (key, expectedText) => {
      const label = getSeverityLabel(key);
      expect(label).toBeDefined();
      render(<div>{label}</div>);
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    test('should return undefined for unknown key', () => {
      const label = getSeverityLabel('unknown');
      expect(label).toBeUndefined();
    });
  });

  describe('getSeverityColumnsConfig', () => {
    test('should return columns without Critical for CVSSv2', () => {
      const columns = getSeverityColumnsConfig(false);

      expect(columns).toHaveLength(5);
      expect(columns.find(col => col.key === 'critical')).toBeUndefined();
      expect(columns.find(col => col.key === 'high')).toBeDefined();
      expect(columns.find(col => col.key === 'medium')).toBeDefined();
      expect(columns.find(col => col.key === 'low')).toBeDefined();
      expect(columns.find(col => col.key === 'log')).toBeDefined();
      expect(columns.find(col => col.key === 'false_positive')).toBeDefined();
    });

    test('should return columns with Critical for CVSSv3', () => {
      const columns = getSeverityColumnsConfig(true);

      expect(columns).toHaveLength(6);
      expect(columns.find(col => col.key === 'critical')).toBeDefined();
      expect(columns.find(col => col.key === 'high')).toBeDefined();
      expect(columns.find(col => col.key === 'medium')).toBeDefined();
      expect(columns.find(col => col.key === 'low')).toBeDefined();
      expect(columns.find(col => col.key === 'log')).toBeDefined();
      expect(columns.find(col => col.key === 'false_positive')).toBeDefined();
    });

    test('should have correct titles', () => {
      const columns = getSeverityColumnsConfig(true);

      const criticalColumn = columns.find(col => col.key === 'critical');
      const highColumn = columns.find(col => col.key === 'high');
      const mediumColumn = columns.find(col => col.key === 'medium');
      const lowColumn = columns.find(col => col.key === 'low');
      const logColumn = columns.find(col => col.key === 'log');
      const fpColumn = columns.find(col => col.key === 'false_positive');

      expect(criticalColumn?.title).toBe('Critical');
      expect(highColumn?.title).toBe('High');
      expect(mediumColumn?.title).toBe('Medium');
      expect(lowColumn?.title).toBe('Low');
      expect(logColumn?.title).toBe('Log');
      expect(fpColumn?.title).toBe('False Positive');
    });

    test('should have correct sortBy fields', () => {
      const columns = getSeverityColumnsConfig(true);

      columns.forEach(column => {
        expect(column.sortBy).toBe(column.key);
      });
    });

    test('should render correct values from entities', () => {
      const columns = getSeverityColumnsConfig(true);
      const mockEntity = {
        result_counts: {
          critical: 5,
          high: 10,
          medium: 15,
          low: 20,
          log: 25,
          false_positive: 2,
        },
      };

      const criticalColumn = columns.find(col => col.key === 'critical');
      const highColumn = columns.find(col => col.key === 'high');
      const mediumColumn = columns.find(col => col.key === 'medium');
      const lowColumn = columns.find(col => col.key === 'low');
      const logColumn = columns.find(col => col.key === 'log');
      const fpColumn = columns.find(col => col.key === 'false_positive');

      expect(criticalColumn?.render(mockEntity)).toBe(5);
      expect(highColumn?.render(mockEntity)).toBe(10);
      expect(mediumColumn?.render(mockEntity)).toBe(15);
      expect(lowColumn?.render(mockEntity)).toBe(20);
      expect(logColumn?.render(mockEntity)).toBe(25);
      expect(fpColumn?.render(mockEntity)).toBe(2);
    });

    test('should handle entities without result_counts', () => {
      const columns = getSeverityColumnsConfig(true);
      const mockEntity = {};

      columns.forEach(column => {
        expect(column.render(mockEntity)).toBeUndefined();
      });
    });
  });

  describe('getComplianceColumnsConfig', () => {
    test('should return three compliance columns', () => {
      const columns = getComplianceColumnsConfig();

      expect(columns).toHaveLength(3);
      expect(columns.find(col => col.key === 'complianceYes')).toBeDefined();
      expect(columns.find(col => col.key === 'complianceNo')).toBeDefined();
      expect(
        columns.find(col => col.key === 'complianceIncomplete'),
      ).toBeDefined();
    });

    test('should have correct titles', () => {
      const columns = getComplianceColumnsConfig();

      const yesColumn = columns.find(col => col.key === 'complianceYes');
      const noColumn = columns.find(col => col.key === 'complianceNo');
      const incompleteColumn = columns.find(
        col => col.key === 'complianceIncomplete',
      );

      expect(yesColumn?.title).toBe('Yes');
      expect(noColumn?.title).toBe('No');
      expect(incompleteColumn?.title).toBe('Incomplete');
    });

    test('should have correct sortBy fields', () => {
      const columns = getComplianceColumnsConfig();

      expect(columns[0].sortBy).toBe('complianceYes');
      expect(columns[1].sortBy).toBe('complianceNo');
      expect(columns[2].sortBy).toBe('complianceIncomplete');
    });

    test('should render correct values from entities', () => {
      const columns = getComplianceColumnsConfig();
      const mockEntity = {
        complianceCounts: {
          yes: 10,
          no: 5,
          incomplete: 3,
        },
      };

      const yesColumn = columns.find(col => col.key === 'complianceYes');
      const noColumn = columns.find(col => col.key === 'complianceNo');
      const incompleteColumn = columns.find(
        col => col.key === 'complianceIncomplete',
      );

      expect(yesColumn?.render(mockEntity)).toBe(10);
      expect(noColumn?.render(mockEntity)).toBe(5);
      expect(incompleteColumn?.render(mockEntity)).toBe(3);
    });

    test('should handle entities without complianceCounts', () => {
      const columns = getComplianceColumnsConfig();
      const mockEntity = {};

      columns.forEach(column => {
        expect(column.render(mockEntity)).toBeUndefined();
      });
    });
  });
});
