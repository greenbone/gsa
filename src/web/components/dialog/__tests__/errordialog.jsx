/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent} from 'web/utils/testing';

import ErrorDialog from '../errordialog';

describe('ErrorDialog component tests', () => {
  test('should render ErrorDialog with text and title', () => {
    const handleClose = testing.fn();

    const {baseElement, getByTestId} = render(
      <ErrorDialog text="foo" title="bar" onClose={handleClose} />,
    );

    expect(baseElement).toMatchSnapshot();
    const contentElement = getByTestId('errordialog-content');
    const titleElement = getByTestId('dialog-title-bar');
    expect(contentElement).toHaveTextContent('foo');
    expect(titleElement).toHaveTextContent('bar');
  });

  test('should close ErrorDialog with close button', () => {
    const handleClose = testing.fn();

    const {getByTestId} = render(
      <ErrorDialog title="bar" onClose={handleClose} />,
    );

    const closeButton = getByTestId('dialog-title-close-button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ErrorDialog with resume button', () => {
    const handleClose = testing.fn();

    const {baseElement} = render(
      <ErrorDialog title="bar" onClose={handleClose} />,
    );

    const buttons = baseElement.querySelectorAll('button');
    fireEvent.click(buttons[0]);
    expect(handleClose).toHaveBeenCalled();
  });

  test('should close ErrorDialog on escape key', () => {
    const handleClose = testing.fn();

    const {getByRole} = render(
      <ErrorDialog title="bar" onClose={handleClose} />,
    );

    fireEvent.keyDown(getByRole('dialog'), {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
