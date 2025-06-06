/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {screen, act, fireEvent, rendererWith} from 'web/testing';
import Reload, {
  NO_RELOAD,
  USE_DEFAULT_RELOAD_INTERVAL,
  USE_DEFAULT_RELOAD_INTERVAL_ACTIVE,
  USE_DEFAULT_RELOAD_INTERVAL_INACTIVE,
} from 'web/components/loading/Reload';

const TestComponent = ({reload, id, reloadOptions}) => (
  <button data-testid={id} onClick={() => reload(reloadOptions)} />
);

const runTimers = async () => {
  await act(async () => {
    testing.runAllTimers();
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

    const renderFunc = testing.fn().mockReturnValue(<div data-testid="foo" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });

  test('should fallback to call reload function on mount', () => {
    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = testing.fn().mockReturnValue(<div data-testid="foo" />);
    const reloadFunc = testing.fn().mockResolvedValue();

    render(
      <Reload name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(screen.getByTestId('foo')).toBeInTheDocument();
  });

  test('should reload when timer fires', async () => {
    testing.useFakeTimers();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();
    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should not reload when initial loading fails', async () => {
    testing.useFakeTimers();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockRejectedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();
    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should not reload when reloading fails', async () => {
    testing.useFakeTimers();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockRejectedValue();

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();
    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();

    reloadFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
  });

  test('should reload on demand after failed loading', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockImplementationOnce(({reload}) => (
        <TestComponent id="one" reload={reload} />
      ));
    const loadFunc = testing.fn().mockRejectedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    const button = screen.queryByTestId('one');
    fireEvent.click(button);

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
  });

  test('should allow to reload on demand', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockImplementationOnce(({reload}) => (
        <TestComponent id="one" reload={reload} />
      ));
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();
    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    reloadFunc.mockClear();

    const button = screen.queryByTestId('one');
    fireEvent.click(button);

    expect(loadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
  });

  test('should allow to calculate reload timer', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    const reloadInterval = testing.fn().mockReturnValue(1000);

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload
        load={loadFunc}
        name="foo"
        reload={reloadFunc}
        reloadInterval={reloadInterval}
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadInterval).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();
    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadInterval).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should not start reload timer if reloadInterval returns equal or less then zero', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    const reloadInterval = testing.fn().mockReturnValue(0);

    const gmp = {
      settings: {
        reloadInterval: 5000,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload
        load={loadFunc}
        name="foo"
        reload={reloadFunc}
        reloadInterval={reloadInterval}
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadInterval).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();
    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadInterval).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });

  test(
    'should fall back to defaultReloadInterval if reloadInterval returns ' +
      'USE_DEFAULT_RELOAD_INTERVAL',
    async () => {
      testing.useFakeTimers();

      const renderFunc = testing
        .fn()
        .mockReturnValueOnce(<div data-testid="one" />)
        .mockReturnValueOnce(<div data-testid="two" />);
      const loadFunc = testing.fn().mockResolvedValue();
      const reloadFunc = testing.fn().mockResolvedValue();

      const reloadInterval = testing
        .fn()
        .mockReturnValue(USE_DEFAULT_RELOAD_INTERVAL);

      const gmp = {
        settings: {
          reloadInterval: 5000,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <Reload
          defaultReloadInterval={NO_RELOAD}
          load={loadFunc}
          name="foo"
          reload={reloadFunc}
          reloadInterval={reloadInterval}
        >
          {renderFunc}
        </Reload>,
      );

      expect(loadFunc).toHaveBeenCalled();
      expect(reloadFunc).not.toHaveBeenCalled();
      expect(renderFunc).toHaveBeenCalled();
      expect(reloadInterval).not.toHaveBeenCalled();
      expect(screen.queryByTestId('one')).toBeInTheDocument();

      loadFunc.mockClear();
      renderFunc.mockClear();

      await runTimers();
      await runTimers();

      expect(loadFunc).not.toHaveBeenCalled();
      expect(reloadFunc).not.toHaveBeenCalled();
      expect(renderFunc).not.toHaveBeenCalled();
      expect(reloadInterval).toHaveBeenCalled();
      expect(screen.queryByTestId('one')).toBeInTheDocument();
      expect(screen.queryByTestId('two')).not.toBeInTheDocument();
    },
  );

  test(
    'should fall back to defaultReloadIntervalActive if reloadInterval ' +
      'returns USE_DEFAULT_RELOAD_INTERVAL_ACTIVE',
    async () => {
      testing.useFakeTimers();

      const renderFunc = testing
        .fn()
        .mockReturnValueOnce(<div data-testid="one" />)
        .mockReturnValueOnce(<div data-testid="two" />);
      const loadFunc = testing.fn().mockResolvedValue();
      const reloadFunc = testing.fn().mockResolvedValue();

      const reloadInterval = testing
        .fn()
        .mockReturnValue(USE_DEFAULT_RELOAD_INTERVAL_ACTIVE);

      const gmp = {
        settings: {
          reloadInterval: 5000,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <Reload
          defaultReloadIntervalActive={NO_RELOAD}
          load={loadFunc}
          name="foo"
          reload={reloadFunc}
          reloadInterval={reloadInterval}
        >
          {renderFunc}
        </Reload>,
      );

      expect(loadFunc).toHaveBeenCalled();
      expect(reloadFunc).not.toHaveBeenCalled();
      expect(renderFunc).toHaveBeenCalled();
      expect(reloadInterval).not.toHaveBeenCalled();
      expect(screen.queryByTestId('one')).toBeInTheDocument();

      loadFunc.mockClear();
      renderFunc.mockClear();

      await runTimers();
      await runTimers();

      expect(loadFunc).not.toHaveBeenCalled();
      expect(reloadFunc).not.toHaveBeenCalled();
      expect(renderFunc).not.toHaveBeenCalled();
      expect(reloadInterval).toHaveBeenCalled();
      expect(screen.queryByTestId('one')).toBeInTheDocument();
      expect(screen.queryByTestId('two')).not.toBeInTheDocument();
    },
  );

  test(
    'should fall back to defaultReloadIntervalInactive if reloadInterval ' +
      'returns USE_DEFAULT_RELOAD_INTERVAL_INACTIVE',
    async () => {
      testing.useFakeTimers();

      const renderFunc = testing
        .fn()
        .mockReturnValueOnce(<div data-testid="one" />)
        .mockReturnValueOnce(<div data-testid="two" />);
      const loadFunc = testing.fn().mockResolvedValue();
      const reloadFunc = testing.fn().mockResolvedValue();

      const reloadInterval = testing
        .fn()
        .mockReturnValue(USE_DEFAULT_RELOAD_INTERVAL_INACTIVE);

      const gmp = {
        settings: {
          reloadInterval: 5000,
        },
      };

      const {render} = rendererWith({gmp});

      render(
        <Reload
          defaultReloadIntervalActive={NO_RELOAD}
          load={loadFunc}
          name="foo"
          reload={reloadFunc}
          reloadInterval={reloadInterval}
        >
          {renderFunc}
        </Reload>,
      );

      expect(loadFunc).toHaveBeenCalled();
      expect(reloadFunc).not.toHaveBeenCalled();
      expect(renderFunc).toHaveBeenCalled();
      expect(reloadInterval).not.toHaveBeenCalled();
      expect(screen.queryByTestId('one')).toBeInTheDocument();

      loadFunc.mockClear();
      renderFunc.mockClear();

      await runTimers();

      expect(loadFunc).not.toHaveBeenCalled();
      expect(reloadFunc).not.toHaveBeenCalled();
      expect(renderFunc).not.toHaveBeenCalled();
      expect(reloadInterval).toHaveBeenCalled();
      expect(screen.queryByTestId('one')).toBeInTheDocument();
      expect(screen.queryByTestId('two')).not.toBeInTheDocument();
    },
  );

  test('should use reloadInterval from settings', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();

    const gmp = {
      settings: {
        reloadInterval: NO_RELOAD,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload load={loadFunc} name="foo" reload={reloadFunc}>
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should use reloadIntervalActive from settings', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();
    const reloadIntervalFunc = testing
      .fn()
      .mockReturnValue(USE_DEFAULT_RELOAD_INTERVAL_ACTIVE);

    const gmp = {
      settings: {
        reloadIntervalActive: NO_RELOAD,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload
        load={loadFunc}
        name="foo"
        reload={reloadFunc}
        reloadInterval={reloadIntervalFunc}
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadIntervalFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadIntervalFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });

  test('should use reloadIntervalInactive from settings', async () => {
    testing.useFakeTimers();

    const renderFunc = testing
      .fn()
      .mockReturnValueOnce(<div data-testid="one" />)
      .mockReturnValueOnce(<div data-testid="two" />);
    const loadFunc = testing.fn().mockResolvedValue();
    const reloadFunc = testing.fn().mockResolvedValue();
    const reloadIntervalFunc = testing
      .fn()
      .mockReturnValue(USE_DEFAULT_RELOAD_INTERVAL_INACTIVE);

    const gmp = {
      settings: {
        reloadIntervalInactive: NO_RELOAD,
      },
    };

    const {render} = rendererWith({gmp});

    render(
      <Reload
        load={loadFunc}
        name="foo"
        reload={reloadFunc}
        reloadInterval={reloadIntervalFunc}
      >
        {renderFunc}
      </Reload>,
    );

    expect(loadFunc).toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).toHaveBeenCalled();
    expect(reloadIntervalFunc).not.toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();

    loadFunc.mockClear();
    renderFunc.mockClear();

    await runTimers();

    expect(loadFunc).not.toHaveBeenCalled();
    expect(reloadFunc).not.toHaveBeenCalled();
    expect(renderFunc).not.toHaveBeenCalled();
    expect(reloadIntervalFunc).toHaveBeenCalled();
    expect(screen.queryByTestId('one')).toBeInTheDocument();
    expect(screen.queryByTestId('two')).not.toBeInTheDocument();
  });
});
