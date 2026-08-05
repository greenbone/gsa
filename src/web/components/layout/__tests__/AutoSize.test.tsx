/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  describe,
  test,
  expect,
  testing,
  beforeEach,
  afterEach,
} from '@gsa/testing';
import {render, screen, act, waitFor} from 'web/testing';
import AutoSize from 'web/components/layout/AutoSize';

const mockRect = (width: number, height: number) =>
  ({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => {},
  }) as DOMRect;

describe('AutoSize', () => {
  beforeEach(() => {
    testing
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(mockRect(800, 600));
  });

  afterEach(() => {
    testing.restoreAllMocks();
  });

  test('should call the children render-prop with the measured size', async () => {
    const children = testing.fn().mockReturnValue(null);

    render(<AutoSize>{children}</AutoSize>);

    await waitFor(() => {
      expect(children).toHaveBeenCalledWith({width: 800, height: 600});
    });
  });

  test('should render the content returned by the children function', async () => {
    render(<AutoSize>{() => <div data-testid="content">inner</div>}</AutoSize>);

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  test('should update dimensions when the window is resized', async () => {
    testing.useFakeTimers();
    const children = testing.fn().mockReturnValue(null);

    render(<AutoSize>{children}</AutoSize>);

    testing
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(mockRect(400, 300));

    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      testing.advanceTimersByTime(200);
    });

    expect(children).toHaveBeenCalledWith({width: 400, height: 300});

    testing.useRealTimers();
  });
});
