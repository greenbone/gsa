/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent} from 'web/utils/testing';

import ConfirmationDialog from '../confirmationdialog';

describe('ConfirmationDialog component tests', () => {
  test('should render ConfirmationDialog with text and title', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    const {baseElement, getByTestId} = render(
      <ConfirmationDialog
        content="foo"
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    expect(baseElement).toMatchSnapshot();
    const contentElement = getByTestId('confirmationdialog-content');
    const titleElement = getByTestId('dialog-title-bar');
    expect(contentElement).toHaveTextContent('foo');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should render ConfirmationDialog with element content and title', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    const {getByTestId} = render(
      <ConfirmationDialog
        content={<div>foo</div>}
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const contentElement = getByTestId('confirmationdialog-content');
    const titleElement = getByTestId('dialog-title-bar');
    expect(contentElement).toHaveTextContent('foo');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should close ConfirmationDialog with close button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    const {getByTestId} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const closeButton = getByTestId('dialog-close-button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog with cancel button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    const {baseElement} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const buttons = baseElement.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should resume ConfirmationDialog with resume button', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    const {baseElement} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    const buttons = baseElement.querySelectorAll('button');
    fireEvent.click(buttons[1]);
    expect(handleResumeClick).toHaveBeenCalled();
  });

  test('should close ConfirmationDialog on escape key', () => {
    const handleClose = testing.fn();
    const handleResumeClick = testing.fn();

    const {getByRole} = render(
      <ConfirmationDialog
        title="bar"
        onClose={handleClose}
        onResumeClick={handleResumeClick}
      />,
    );

    fireEvent.keyDown(getByRole('dialog'), {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
