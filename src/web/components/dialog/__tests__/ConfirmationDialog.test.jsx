/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {closeDialog, screen, render, fireEvent} from 'web/testing';
import {KeyCode} from 'gmp/utils/event';
import ConfirmationDialog from 'web/components/dialog/ConfirmationDialog';

describe('ConfirmationDialog component tests', () => {
  test('should render ConfirmationDialog with text and title', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        content="foo"
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    expect(screen.queryDialog()).toBeInTheDocument();

    expect(screen.queryDialogContent()).toHaveTextContent('foo');
    expect(screen.queryDialogTitle()).toHaveTextContent('bar');
  });

  test('should render ConfirmationDialog with element content and title', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        content={<div>foo</div>}
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    expect(screen.queryDialog()).toBeInTheDocument();

    expect(screen.queryDialogContent()).toHaveTextContent('foo');
    expect(screen.queryDialogTitle()).toHaveTextContent('bar');
  });

  test('should close ConfirmationDialog with close button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    closeDialog();

    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog with cancel button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog-close-button'));
    expect(handleClose).toHaveBeenCalled();
  });

  test('should resume ConfirmationDialog with resume button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.click(screen.getByTestId('dialog-save-button'));
    expect(handleResumeClick).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog on escape key', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.keyDown(screen.getDialog(), {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
