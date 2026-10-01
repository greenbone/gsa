/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {fireEvent, rendererWith, screen} from 'web/testing';
import ReportExportProgressDialog from 'web/pages/reports/ReportExportProgressDialog';

describe('ReportExportProgressDialog', () => {
  test('shows progress and allows cancel while active', () => {
    const onCancel = testing.fn();
    const {render} = rendererWith();

    render(
      <ReportExportProgressDialog
        state={{
          status: 'running',
          exportData: {progress: 'generating'},
        }}
        onCancel={onCancel}
        onClose={testing.fn()}
      />,
    );

    expect(screen.getByText('Status: running')).toBeInTheDocument();
    expect(screen.getByText('Progress: generating')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', {name: 'Cancel Export'}));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  test('disables cancel after the export reaches a terminal state', () => {
    const {render} = rendererWith();

    render(
      <ReportExportProgressDialog
        state={{status: 'done', exportData: {status: 'done'}}}
        onCancel={testing.fn()}
        onClose={testing.fn()}
      />,
    );

    expect(screen.getByRole('button', {name: 'Cancel Export'})).toBeDisabled();
  });
});
