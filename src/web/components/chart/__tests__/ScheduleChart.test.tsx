/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import date from 'gmp/models/date';
import ScheduleChart from 'web/components/chart/ScheduleChart';
import Theme from 'web/utils/theme';

describe('ScheduleChart component tests', () => {
  test('should render schedule bars, gradients, and future run triangle markers', () => {
    const {render} = rendererWith();

    const starts = [date('2026-01-01T10:00:00Z'), date('2026-01-02T10:00:00Z')];

    render(
      <ScheduleChart
        data={[
          {
            color: '#66cc66',
            label:
              'A scheduled task with a very long label that should be truncated',
            starts,
            toolTip: 'Task tooltip',
          },
        ]}
        endDate={date('2026-01-07T00:00:00Z')}
        height={300}
        startDate={date('2026-01-01T00:00:00Z')}
        width={800}
        yAxisLabel="Schedules"
      />,
    );

    const chart = screen.getByTestId('schedule-chart-svg');

    expect(screen.getAllByTestId(/^schedule-bar-/)).toHaveLength(2);
    expect(screen.getByTestId('schedule-future-run')).toBeInTheDocument();
    expect(
      chart.querySelector('linearGradient#green_stroke_gradient'),
    ).toBeInTheDocument();
    expect(
      chart.querySelector('linearGradient#green_fill_gradient'),
    ).toBeInTheDocument();
    expect(chart.querySelectorAll('.axis-tick').length).toBeGreaterThan(0);
  });

  test('should render duration and period schedules with future-run markers', () => {
    const {render} = rendererWith();

    render(
      <ScheduleChart
        data={[
          {
            color: '#66cc66',
            duration: 3600,
            label: 'Duration schedule',
            starts: [date('2026-01-01T10:00:00Z')],
            toolTip: 'Duration tooltip',
          },
          {
            color: '#66cc66',
            label: 'Period schedule',
            period: 2 * 24 * 60 * 60,
            starts: [date('2026-01-02T10:00:00Z')],
            toolTip: 'Period tooltip',
          },
          {
            color: '#66cc66',
            isInfinite: true,
            label: 'Infinite schedule',
            starts: [],
            toolTip: 'Infinite tooltip',
          },
        ]}
        endDate={date('2026-01-07T00:00:00Z')}
        height={300}
        startDate={date('2026-01-01T00:00:00Z')}
        width={800}
      />,
    );

    expect(screen.getAllByTestId(/^schedule-bar-/)).toHaveLength(2);
    expect(screen.getAllByTestId('schedule-future-run')).toHaveLength(3);
    expect(screen.getByTestId('schedule-bar-0')).toHaveAttribute(
      'fill',
      Theme.lightGreen,
    );
  });

  test('should render no bars or future-run markers for empty data', () => {
    const {render} = rendererWith();

    render(
      <ScheduleChart
        data={[]}
        endDate={date('2026-01-07T00:00:00Z')}
        height={300}
        startDate={date('2026-01-01T00:00:00Z')}
        width={800}
      />,
    );

    expect(screen.queryAllByTestId(/^schedule-bar-/)).toHaveLength(0);
    expect(screen.queryAllByTestId('schedule-future-run')).toHaveLength(0);
  });
});
