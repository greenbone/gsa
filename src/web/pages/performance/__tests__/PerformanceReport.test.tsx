/* SPDX-FileCopyrightText: 2025 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {rendererWith, screen, wait} from 'web/testing';
import {PerformanceReport as PerformanceReportModel} from 'gmp/commands/performance';
import date from 'gmp/models/date';
import PerformanceReport from 'web/pages/performance/PerformanceReport';

describe('PerformanceReport', () => {
  test('renders nothing if report or report details are undefined', async () => {
    const gmp = {
      performance: {
        get: testing.fn().mockResolvedValue({data: undefined}),
      },
    };
    const {render} = rendererWith({gmp});
    render(
      <PerformanceReport
        data-testid="performance-report"
        endDate={date()}
        name="Test Report"
        startDate={date()}
      />,
    );
    await wait();

    expect(gmp.performance.get).toHaveBeenCalled();

    expect(screen.queryByTestId('performance-report')).not.toBeInTheDocument();
  });

  test('renders a text report if format is txt', async () => {
    const data = new PerformanceReportModel({
      report: {_format: 'txt', __text: 'Sample Text Report'},
      name: 'Test Report',
      title: 'Test Title',
    });
    const gmp = {
      performance: {
        get: testing.fn().mockResolvedValue({data}),
      },
    };

    const {render} = rendererWith({gmp});
    render(
      <PerformanceReport
        data-testid="performance-report"
        endDate={date()}
        name="Test Report"
        startDate={date()}
      />,
    );
    await wait();

    expect(gmp.performance.get).toHaveBeenCalled();
    expect(screen.getByTestId('performance-report')).toBeInTheDocument();
    expect(screen.getByText('Sample Text Report')).toBeInTheDocument();
  });

  test('renders an image if format is png', async () => {
    const data = new PerformanceReportModel({
      report: {_format: 'png', __text: 'base64EncodedImage'},
      name: 'Test Report',
      title: 'Test Title',
    });
    const gmp = {
      performance: {
        get: testing.fn().mockResolvedValue({data}),
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <PerformanceReport
        data-testid="performance-report"
        endDate={date()}
        name="Test Report"
        startDate={date()}
      />,
    );
    await wait();

    expect(gmp.performance.get).toHaveBeenCalled();
    expect(screen.getByTestId('performance-report')).toBeInTheDocument();
    const img = screen.getByAltText('System report for Test Title');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      'src',
      'data:image/png;charset=utf-8;base64,base64EncodedImage',
    );
  });

  test('renders an error message if format is unsupported', async () => {
    const data = new PerformanceReportModel({
      report: {_format: 'foo', __text: 'something'},
      name: 'Test Report',
      title: 'Test Title',
    });
    const gmp = {
      performance: {
        get: testing.fn().mockResolvedValue({data}),
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <PerformanceReport
        data-testid="performance-report"
        endDate={date()}
        name="Test Report"
        startDate={date()}
      />,
    );
    await wait();

    expect(gmp.performance.get).toHaveBeenCalled();
    expect(screen.getByTestId('performance-report')).toBeInTheDocument();
    expect(
      screen.getByText('Error: Unknown Performance Report'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The performance report format foo is not supported.'),
    ).toBeInTheDocument();
  });
});
