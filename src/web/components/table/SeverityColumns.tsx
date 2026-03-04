/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {_} from 'gmp/locale/lang';
import SeverityClassLabel from 'web/components/label/SeverityClass';

type EntityWithCounts = {
  result_counts?: Record<string, number>;
  complianceCounts?: Record<string, number>;
};

export interface SeverityColumnConfig<T = EntityWithCounts> {
  key: string;
  title: string;
  width?: string;
  sortBy?: string;
  align?: 'start' | 'center' | 'end';
  render: (entity: T, ...args: unknown[]) => React.ReactNode;
}

export const getSeverityLabel = (key: string) => {
  switch (key) {
    case 'critical':
      return <SeverityClassLabel.Critical />;
    case 'high':
      return <SeverityClassLabel.High />;
    case 'medium':
      return <SeverityClassLabel.Medium />;
    case 'low':
      return <SeverityClassLabel.Low />;
    case 'log':
      return <SeverityClassLabel.Log />;
    case 'false_positive':
      return <SeverityClassLabel.FalsePositive />;
    default:
      return undefined;
  }
};

/**
 * Get severity column configurations for vulnerability scan results
 * @param useCVSSv3 - Whether to include the Critical severity column (CVSSv3 only)
 * @param columnWidth - Optional width for each severity column (default: '3%')
 * @returns Array of column configurations for severity columns
 */
export const getSeverityColumnsConfig = <
  T extends EntityWithCounts = EntityWithCounts,
>(
  useCVSSv3 = false,
  columnWidth = '3%',
): SeverityColumnConfig<T>[] => {
  const columns: SeverityColumnConfig<T>[] = [];

  if (useCVSSv3) {
    columns.push({
      key: 'critical',
      title: _('Critical'),
      width: columnWidth,
      sortBy: 'critical',
      render: (entity: T) => entity.result_counts?.critical,
    });
  }

  columns.push(
    {
      key: 'high',
      title: _('High'),
      width: columnWidth,
      sortBy: 'high',
      render: (entity: T) => entity.result_counts?.high,
    },
    {
      key: 'medium',
      title: _('Medium'),
      width: columnWidth,
      sortBy: 'medium',
      render: (entity: T) => entity.result_counts?.medium,
    },
    {
      key: 'low',
      title: _('Low'),
      width: columnWidth,
      sortBy: 'low',
      render: (entity: T) => entity.result_counts?.low,
    },
    {
      key: 'log',
      title: _('Log'),
      width: columnWidth,
      sortBy: 'log',
      render: (entity: T) => entity.result_counts?.log,
    },
    {
      key: 'false_positive',
      title: _('False Positive'),
      width: columnWidth,
      sortBy: 'false_positive',
      render: (entity: T) => entity.result_counts?.false_positive,
    },
  );

  return columns;
};

/**
 * Get compliance column configurations for audit scan results
 * @param columnWidth - Optional width for each compliance column (default: '4.5%')
 * @returns Array of column configurations for compliance columns
 */
export const getComplianceColumnsConfig = <
  T extends EntityWithCounts = EntityWithCounts,
>(
  columnWidth = '4.5%',
): SeverityColumnConfig<T>[] => {
  return [
    {
      key: 'complianceYes',
      title: _('Yes'),
      width: columnWidth,
      sortBy: 'complianceYes',
      render: (entity: T) => entity.complianceCounts?.yes,
    },
    {
      key: 'complianceNo',
      title: _('No'),
      width: columnWidth,
      sortBy: 'complianceNo',
      render: (entity: T) => entity.complianceCounts?.no,
    },
    {
      key: 'complianceIncomplete',
      title: _('Incomplete'),
      width: columnWidth,
      sortBy: 'complianceIncomplete',
      render: (entity: T) => entity.complianceCounts?.incomplete,
    },
  ];
};
