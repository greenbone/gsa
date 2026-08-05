/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, testing} from '@gsa/testing';
import {render, screen, act, waitFor} from 'web/testing';
import AutoSize from 'web/components/layout/AutoSize';

describe('AutoSize', () => {
  test('should call the children render-prop with the measured size', async () => {
    const children = testing.fn().mockReturnValue(null);
    const measure = testing.fn().mockReturnValue({width: 800, height: 600});

    render(<AutoSize measure={measure}>{children}</AutoSize>);

    await waitFor(() => {
      expect(children).toHaveBeenCalledWith({width: 800, height: 600});
    });
  });

  test('should render the content returned by the children function', async () => {
    render(
      <AutoSize measure={() => ({width: 800, height: 600})}>
        {() => <div data-testid="content">inner</div>}
      </AutoSize>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('content')).toBeInTheDocument();
    });
  });

  test('should update dimensions when the window is resized', async () => {
    testing.useFakeTimers();
    const children = testing.fn().mockReturnValue(null);
    let size = {width: 800, height: 600};

    render(<AutoSize measure={() => size}>{children}</AutoSize>);
    size = {width: 400, height: 300};

    await act(async () => {
      window.dispatchEvent(new Event('resize'));
      testing.advanceTimersByTime(200);
    });

    expect(children).toHaveBeenCalledWith({width: 400, height: 300});
    testing.useRealTimers();
  });
});
