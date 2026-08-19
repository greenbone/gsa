/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {closeDialog, fireEvent, render, screen} from 'web/testing';
import ConfirmRemoveDialog from 'web/pages/start/ConfirmRemoveDialog';

const dashboardId = 'dashboard-1';
const dashboardTitle = 'Operations';

const renderDialog = () => {
  const onConfirm = testing.fn();
  const onDeny = testing.fn();

  render(
    <ConfirmRemoveDialog
      dashboardId={dashboardId}
      dashboardTitle={dashboardTitle}
      onConfirm={onConfirm}
      onDeny={onDeny}
    />,
  );

  return {onConfirm, onDeny};
};

describe('ConfirmRemoveDialog', () => {
  test('should render the dashboard title and confirmation message', () => {
    renderDialog();

    expect(screen.queryDialogTitle()).toHaveTextContent(
      `Remove Dashboard ${dashboardTitle}`,
    );
    expect(screen.queryDialogContent()).toHaveTextContent(
      `Do you really want to remove the Dashboard ${dashboardTitle} and its configuration?`,
    );
  });

  test('should confirm removal with the dashboard id', () => {
    const {onConfirm, onDeny} = renderDialog();

    fireEvent.click(screen.getByTestId('dialog-save-button'));

    expect(onConfirm).toHaveBeenCalledWith(dashboardId);
    expect(onDeny).not.toHaveBeenCalled();
  });

  test('should deny removal with the cancel button', () => {
    const {onConfirm, onDeny} = renderDialog();

    fireEvent.click(screen.getByTestId('dialog-close-button'));

    expect(onDeny).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  test('should deny removal when the dialog is closed', () => {
    const {onConfirm, onDeny} = renderDialog();

    closeDialog();

    expect(onDeny).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
