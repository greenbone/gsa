/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';

import {isFunction} from 'gmp/utils/identity';
import {KeyCode} from 'gmp/utils/event';

import {render, fireEvent} from 'web/utils/testing';

import Dialog from '../dialog';

describe('Dialog component tests', () => {
  test('should render a Dialog', () => {
    const handleClose = testing.fn();
    const renderFunc = testing.fn().mockReturnValue(<div />);

    const {baseElement} = render(
      <Dialog onClose={handleClose}>{renderFunc}</Dialog>,
    );

    expect(baseElement).toMatchSnapshot();

    expect(renderFunc).toHaveBeenCalled();

    // eslint-disable-next-line prefer-destructuring
    const renderProps = renderFunc.mock.calls[0][0];
    expect(isFunction(renderProps.close)).toEqual(true);
    expect(renderProps.moveProps).toBeDefined();
    expect(isFunction(renderProps.moveProps.onMouseDown)).toEqual(true);
    expect(renderProps.heightProps).toBeDefined();
    expect(renderProps.heightProps.maxHeight).toBeDefined();
  });

  test('should close Dialog', () => {
    const handleClose = testing.fn();
    const renderFunc = testing.fn().mockReturnValue(<div />);

    render(<Dialog onClose={handleClose}>{renderFunc}</Dialog>);

    expect(renderFunc).toHaveBeenCalled();

    // eslint-disable-next-line prefer-destructuring
    const renderProps = renderFunc.mock.calls[0][0];
    expect(isFunction(renderProps.close)).toEqual(true);
    renderProps.close();

    expect(handleClose).toHaveBeenCalled();
  });

  test('should close Dialog on escape key', () => {
    const handleClose = testing.fn();
    const renderFunc = testing.fn().mockReturnValue(<div />);

    const {getByRole} = render(
      <Dialog onClose={handleClose}>{renderFunc}</Dialog>,
    );

    expect(renderFunc).toHaveBeenCalled();

    fireEvent.keyDown(getByRole('dialog'), {
      key: 'Escape',
      keyCode: KeyCode.ESC,
    });

    expect(handleClose).toHaveBeenCalled();
  });
});

// vim: set ts=2 sw=2 tw=80:
