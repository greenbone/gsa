/* Copyright (C) 2019-2021 Greenbone Networks GmbH
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

import {render, fireEvent} from 'web/utils/testing';

import Dialog from '../dialog';
import {isFunction} from 'gmp/utils/identity';
import {KeyCode} from 'gmp/utils/event';

describe('Dialog component tests', () => {
  test('should render a Dialog', () => {
    const handleClose = jest.fn();
    const renderFunc = jest.fn().mockReturnValue(<div />);

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
    const handleClose = jest.fn();
    const renderFunc = jest.fn().mockReturnValue(<div />);

    render(<Dialog onClose={handleClose}>{renderFunc}</Dialog>);

    expect(renderFunc).toHaveBeenCalled();

    // eslint-disable-next-line prefer-destructuring
    const renderProps = renderFunc.mock.calls[0][0];
    expect(isFunction(renderProps.close)).toEqual(true);
    renderProps.close();

    expect(handleClose).toHaveBeenCalled();
  });

  test('should close Dialog on escape key', () => {
    const handleClose = jest.fn();
    const renderFunc = jest.fn().mockReturnValue(<div />);

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
