/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import date from 'gmp/models/date';
import ScheduleChart from 'web/components/chart/Schedule';

describe('Schedule chart integration tests', () => {
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

    const mainContainer = screen.getByTestId('main-container');

    expect(mainContainer.querySelectorAll('rect').length).toEqual(2);
    expect(
      mainContainer.querySelectorAll('path[opacity="0.5"]').length,
    ).toEqual(1);
    expect(
      mainContainer.querySelector('linearGradient#green_stroke_gradient'),
    ).toBeInTheDocument();
    expect(
      mainContainer.querySelector('linearGradient#green_fill_gradient'),
    ).toBeInTheDocument();
    expect(mainContainer.querySelectorAll('.axis-tick').length).toBeGreaterThan(
      0,
    );
  });
});
