/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test} from '@gsa/testing';
import {rendererWith, screen} from 'web/testing';
import ReportTask from 'gmp/models/report/task';
import {TASK_STATUS} from 'gmp/models/task';
import {createSession} from 'gmp/testing';
import ReportDetailsHeader from 'web/pages/reports/details/ReportDetailsHeader';

const createGmp = () => ({
  session: createSession(),
});

describe('ReportDetailsHeader', () => {
  test('renders an interrupted report with the shared status bar', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ReportDetailsHeader progress={0} status={TASK_STATUS.interrupted} />,
    );

    expect(screen.getByRole('heading', {name: 'Report'})).toBeInTheDocument();
    expect(screen.getByTestId('statusbar-text')).toHaveTextContent(
      'Interrupted at 0 %',
    );
    expect(screen.getByTestId('progressbar-box')).toBeInTheDocument();
  });

  test('renders an active report with shared status bar progress', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(<ReportDetailsHeader progress={42} status={TASK_STATUS.running} />);

    expect(screen.getByTestId('statusbar-text')).toHaveTextContent('42 %');
    expect(screen.getByTestId('progress')).toHaveComputedStyle('width', '42%');
  });

  test('shows the import task type for an import report', () => {
    const {render} = rendererWith({gmp: createGmp()});

    render(
      <ReportDetailsHeader task={ReportTask.fromElement({_id: 'task'})} />,
    );

    expect(screen.getByText('Import Task')).toBeInTheDocument();
  });
});
