/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import {TASK_STATUS} from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import ReportDetailsHeader from 'web/pages/reports/details/ReportDetailsHeader';

const createGmp = () => ({
  session: createSession(),
});

describe('ReportDetailsHeader', () => {
  test('renders an interrupted report as a compact status badge', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ReportDetailsHeader progress={0} status={TASK_STATUS.interrupted} />,
    );

    expect(screen.getByRole('heading', {name: 'Report'})).toBeInTheDocument();
    expect(screen.getByTestId('report-status-panel')).toHaveTextContent(
      'Interrupted at 0 %',
    );
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  test('renders an active report with its running status color', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(<ReportDetailsHeader progress={42} status={TASK_STATUS.running} />);

    expect(screen.getByTestId('report-status-panel')).toHaveTextContent(
      'Running',
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });
});
