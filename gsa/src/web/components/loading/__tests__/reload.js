/* Copyright (C) 2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */
import React from 'react';

import {act, fireEvent, rendererWith} from 'web/utils/testing';

import Reload from '../reload';

// eslint-disable-next-line react/prop-types
const TestComponent = ({reload, id, reloadOptions}) => (
  <button data-testid={id} onClick={() => reload(reloadOptions)} />
);

const runTimers = async () => {
  await Promise.resolve(); // required for firing the timer https://github.com/facebook/jest/issues/7151
  act(() => {
    jest.runAllTimers();
  });
};

describe('Reload component tests', () => {
  test('should call load function on mount', () => {
    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = jest.fn().mockReturnValue(<div data-testid="foo" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const {getByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();

    expect(getByTestId('foo')).toBeInTheDocument();
  });

  test('should fallback to call reload function on mount', () => {
    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = jest.fn().mockReturnValue(<div data-testid="foo" />);
    const reloadFunc = jest.fn().mockResolvedValue();

    const {getByTestId} = render(
      <Reload reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();

    expect(getByTestId('foo')).toBeInTheDocument();
  });

  test('should reload when timer fires', async () => {
    jest.useFakeTimers();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const {queryByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should not reload when initial loading fails', async () => {
    jest.useFakeTimers();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockRejectedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const {queryByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should not reload when reloading fails', async () => {
    jest.useFakeTimers();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockRejectedValue();

    const {queryByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();

    reloadFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
  });

  test('should reload on demand after failed loading', async () => {
    jest.useFakeTimers();

    const renderFunc = jest
      .fn()
      .mockImplementationOnce(({reload}) => (
        <TestComponent reload={reload} id="one" />
      ));
    const loadFunc = jest.fn().mockRejectedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    const button = queryByTestId('one');
    fireEvent.click(button);

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
  });

  test('should allow to reload on demand', async () => {
    jest.useFakeTimers();

    const renderFunc = jest
      .fn()
      .mockImplementationOnce(({reload}) => (
        <TestComponent reload={reload} id="one" />
      ));
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    reloadFunc.mockClear();

    const button = queryByTestId('one');
    fireEvent.click(button);

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
  });

  test('should allow to calculate reload timer', async () => {
    jest.useFakeTimers();

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const reloadInterval = jest.fn().mockReturnValue(1000);

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <Reload
        load={loadFunc}
        reload={reloadFunc}
        reloadInterval={reloadInterval}
        name="foo"
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadInterval).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadInterval).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should not start reload timer if reloadInterval returns equal or less then zero', async () => {
    jest.useFakeTimers();

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const reloadInterval = jest.fn().mockReturnValue(0);

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <Reload
        load={loadFunc}
        reload={reloadFunc}
        reloadInterval={reloadInterval}
        name="foo"
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadInterval).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadInterval).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should fall back to defaultReloadInterval if reloadInterval returns undefined', async () => {
    jest.useFakeTimers();

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const reloadInterval = jest.fn().mockReturnValue(undefined);

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <Reload
        defaultReloadInterval={-1}
        load={loadFunc}
        reload={reloadFunc}
        reloadInterval={reloadInterval}
        name="foo"
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadInterval).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadInterval).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should use defaultReloadInterval for reload timer', async () => {
    jest.useFakeTimers();

    const renderFunc = jest
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = jest.fn().mockResolvedValue();
    const reloadFunc = jest.fn().mockResolvedValue();

    const gmp = {
      settings: {
        reloadInterval: -1,
      },
    };

    const {render} = rendererWith({gmp});

    const {queryByTestId} = render(
      <Reload load={loadFunc} reload={reloadFunc} name="foo">
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();

    expect(queryByTestId('one')).toBeInTheDocument();
    expect(queryByTestId('two')).not.toBeInTheDocument();
  });
});
