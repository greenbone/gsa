/* Copyright (C) 2020-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import {rendererWith, screen, fireEvent} from 'web/utils/testing';

import useDialogNotification from '../useDialogNotification';
import DialogNotification from '../dialognotification';

const TestComponent = () => {
  const {
    dialogState,
    closeDialog,
    showMessage,
    showError,
    showErrorMessage,
    showSuccessMessage,
  } = useDialogNotification();
  return (
    <div>
      <button data-testid="show-message" onClick={() => showMessage('foo')} />
      <button
        data-testid="show-message-with-subject"
        onClick={() => showMessage('foo', 'bar')}
      />
      <button
        data-testid="show-error-message"
        onClick={() => showErrorMessage('foo')}
      />
      <button
        data-testid="show-success-message"
        onClick={() => showSuccessMessage('foo')}
      />
      <button
        data-testid="show-error"
        onClick={() => showError(new Error('foo'))}
      />
      <DialogNotification {...dialogState} onCloseClick={closeDialog} />
    </div>
  );
};
describe('DialogNotification tests', () => {
  test('should display a message', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Message');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display a message with subject', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-message-with-subject');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('bar');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should allow to close dialog', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    const button = screen.getByTestId('show-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Message');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');

    const dialogFooter = screen.getByTestId('dialog-notification-footer');
    const closeButton = dialogFooter.querySelector('button');

    fireEvent.click(closeButton);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('should display an error message', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-error-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Error');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display a success message', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-success-message');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Success');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });

  test('should display an error', () => {
    const {render} = rendererWith();

    render(<TestComponent />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const button = screen.getByTestId('show-error');

    fireEvent.click(button);

    const dialogTitleBar = screen.getByTestId('dialog-title-bar');

    expect(dialogTitleBar).toHaveTextContent('Error');

    const dialogContent = screen.getByTestId('dialog-notification-message');

    expect(dialogContent).toHaveTextContent('foo');
  });
});
