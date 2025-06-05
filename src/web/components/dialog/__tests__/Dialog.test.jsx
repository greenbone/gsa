/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {KeyCode} from 'gmp/utils/event';
import {isFunction} from 'gmp/utils/identity';
import Dialog from 'web/components/dialog/Dialog';
import {screen, render, fireEvent} from 'web/testing';

describe('Dialog component tests', () => {
  test('should render a Dialog', () => {
    const handleClose = testing.fn();
    const renderFunc = testing.fn().mockReturnValue(<div />);

    render(<Dialog onClose={handleClose}>{renderFunc}</Dialog>);
    screen.getDialog();

    expect(renderFunc).toHaveBeenCalled();

    const renderProps = renderFunc.mock.calls[0][0];
    expect(isFunction(renderProps.close)).toEqual(true);
  });

  test('should close Dialog', () => {
    const handleClose = testing.fn();
    const renderFunc = testing.fn().mockReturnValue(<div />);

    render(<Dialog onClose={handleClose}>{renderFunc}</Dialog>);

    expect(renderFunc).toHaveBeenCalled();

    const renderProps = renderFunc.mock.calls[0][0];
    expect(isFunction(renderProps.close)).toEqual(true);
    renderProps.close();

    expect(handleClose).toHaveBeenCalled();
  });

  test('should close Dialog on escape key', () => {
    const handleClose = testing.fn();
    const renderFunc = testing.fn().mockReturnValue(<div />);

    render(<Dialog onClose={handleClose}>{renderFunc}</Dialog>);

    expect(renderFunc).toHaveBeenCalled();

    const dialog = screen.getDialog();
    fireEvent.keyDown(dialog, {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});
