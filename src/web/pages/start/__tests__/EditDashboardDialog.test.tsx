/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {changeInputValue, fireEvent, render, screen} from 'web/testing';
import EditDashboardDialog from 'web/pages/start/EditDashboardDialog';

const dashboardId = 'dashboard-1';
const dashboardTitle = 'Operations';

const renderDialog = () => {
  const onClose = testing.fn();
  const onSave = testing.fn();

  render(
    <EditDashboardDialog
      dashboardId={dashboardId}
      dashboardTitle={dashboardTitle}
      onClose={onClose}
      onSave={onSave}
    />,
  );

  return {onClose, onSave};
};

describe('EditDashboardDialog', () => {
  test('should render the title and current dashboard name', () => {
    renderDialog();

    expect(screen.getDialogTitle()).toHaveTextContent('Edit Dashboard');
    expect(
      screen.getByRole('textbox', {name: 'Dashboard Title'}),
    ).toBeInTheDocument();
  });

  test('should save the updated dashboard title', () => {
    const {onSave} = renderDialog();
    const input = screen.getByRole('textbox', {name: 'Dashboard Title'});

    changeInputValue(input, 'Updated Operations');
    fireEvent.click(screen.getDialogSaveButton());

    expect(onSave).toHaveBeenCalledWith({
      dashboardId,
      dashboardTitle: 'Updated Operations',
    });
  });

  test('should close without saving when cancel is clicked', () => {
    const {onClose, onSave} = renderDialog();

    fireEvent.click(screen.getDialogCloseButton());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });
});
