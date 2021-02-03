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

/* eslint-disable react/prop-types */

import React, {useState, useCallback} from 'react';

import {isDefined} from 'gmp/utils/identity';

import {fireEvent, rendererWith, screen, wait} from 'web/utils/testing';

import useReload from '../useReload';

const TestComponent = ({reload, timeout}) => {
  const [value, setValue] = useState(0);

  const reloadFunc = useCallback(() => {
    const newValue = reload();
    if (isDefined(newValue.then)) {
      return newValue.then(val => setValue(val));
    }

    setValue(newValue);
  }, [reload]);

  const [startReload, stopReload] = useReload(reloadFunc, timeout);

  return (
    <div>
      <button data-testid="start" onClick={startReload} />
      <button data-testid="stop" onClick={stopReload} />
      <div data-testid="value">{value}</div>
    </div>
  );
};

describe('useReload tests', () => {
  test('should use timeout function to calculate reload timer', async () => {
    const reload = jest.fn(() => 'foo');
    const timeout = jest.fn(() => 100);

    const {render} = rendererWith();

    render(<TestComponent timeout={timeout} reload={reload} />);

    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('start'));

    await wait();

    expect(timeout).toHaveBeenCalled();

    await wait(100);

    expect(reload).toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('foo');
  });

  test('should pass visibility to timeout function to calculate reload timer', async () => {
    const hidden = jest
      .fn()
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    const reload = jest.fn().mockResolvedValue('foo');
    const timeout = jest.fn(() => 100);

    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: hidden,
    });

    const {render} = rendererWith();

    render(<TestComponent timeout={timeout} reload={reload} />);

    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('start'));

    await wait();

    expect(timeout).toHaveBeenCalledTimes(1);
    expect(timeout).toHaveBeenCalledWith({isVisible: false});
    timeout.mockClear();

    expect(hidden).toHaveBeenCalled();
    hidden.mockClear();

    await wait(100);

    expect(timeout).toHaveBeenCalledTimes(1);
    expect(timeout).toHaveBeenCalledWith({isVisible: true});

    expect(hidden).toHaveBeenCalled();

    expect(reload).toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('foo');
  });

  test('should use timeout function to calculate reload timer on every render', async () => {
    const reload = jest
      .fn()
      .mockResolvedValueOnce('foo')
      .mockResolvedValueOnce('bar');
    const timeout = jest.fn(() => 100);

    const {render} = rendererWith();

    render(<TestComponent timeout={timeout} reload={reload} />);

    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('start'));

    await wait();

    expect(timeout).toHaveBeenCalled();

    await wait(100);

    expect(reload).toHaveBeenCalled();
    reload.mockClear();

    expect(screen.getByTestId('value')).toHaveTextContent('foo');

    await wait(100);

    expect(reload).toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('bar');
  });

  test('should stop reloading if reload promise rejects', async () => {
    const reload = jest.fn().mockResolvedValueOnce('foo').mockRejectedValue();
    const timeout = jest.fn(() => 100);

    const {render} = rendererWith();

    render(<TestComponent timeout={timeout} reload={reload} />);

    expect(reload).not.toHaveBeenCalled();
    expect(timeout).not.toHaveBeenCalled();

    expect(screen.getByTestId('value')).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('start'));

    await wait();

    expect(timeout).toHaveBeenCalled();

    await wait(100);

    expect(reload).toHaveBeenCalled();
    reload.mockClear();

    expect(screen.getByTestId('value')).toHaveTextContent('foo');

    await wait(100);

    expect(reload).toHaveBeenCalled();
    reload.mockClear();

    await wait(100);

    expect(reload).not.toHaveBeenCalled();
  });
});
