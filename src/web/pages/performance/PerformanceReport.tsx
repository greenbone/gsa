/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useEffect, useState, type ReactNode} from 'react';
import {type PerformanceReport as PerformanceReportModel} from 'gmp/commands/performance';
import {type Date} from 'gmp/models/date';
import ErrorMessage from 'web/components/error/ErrorMessage';
import LinkTarget from 'web/components/link/Target';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {
  type Duration,
  getDurationInSeconds,
} from 'web/pages/performance/durations';

interface PerformanceReportProps {
  name: string;
  duration?: Duration;
  sensorId?: string;
  endDate: Date;
  startDate: Date;
  'data-testid'?: string;
}

const PerformanceReport = ({
  name,
  duration,
  sensorId,
  endDate,
  startDate,
  'data-testid': dataTestId,
}: PerformanceReportProps) => {
  const [_] = useTranslation();
  const gmp = useGmp();
  const numberDuration = duration ? getDurationInSeconds(duration) : undefined;
  const [report, setReport] = useState<PerformanceReportModel | undefined>(
    undefined,
  );

  useEffect(() => {
    async function fetchReport() {
      const report = await gmp.performance.get({
        name,
        duration: numberDuration,
        sensorId,
        startDate,
        endDate,
      });
      setReport(report.data);
    }
    void fetchReport();
  }, [endDate, gmp.performance, name, numberDuration, sensorId, startDate]);

  if (!report?.details) {
    return null;
  }

  const format = report.details.format.toLowerCase();
  let content: ReactNode | undefined;

  if (format === 'txt') {
    content = <pre>{report?.details?.text}</pre>;
  } else if (format === 'png') {
    content = (
      <img
        alt={_('System report for {{name}}', {name: report.title})}
        src={`data:image/png;charset=utf-8;base64,${report?.details?.text}`}
      />
    );
  } else {
    content = (
      <ErrorMessage message={_('Error: Unknown Performance Report')}>
        {_('The performance report format {{format}} is not supported.', {
          format,
        })}
      </ErrorMessage>
    );
  }

  return (
    <div data-testid={dataTestId}>
      <LinkTarget id={name} />
      <h2>{report.title}</h2>
      {content}
    </div>
  );
};

export default PerformanceReport;
