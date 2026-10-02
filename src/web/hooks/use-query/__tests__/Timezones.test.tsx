/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, expect, test, testing} from '@gsa/testing';
import {rendererWith, screen, waitFor} from 'web/testing';
import {createSession} from 'gmp/testing';
import {useGetTimezones} from 'web/hooks/use-query/timezones';

describe('useGetTimezones', () => {
  test('should fetch timezones', async () => {
    const get = testing.fn().mockResolvedValue({
      data: [{name: 'UTC'}],
    });
    const gmp = {
      session: createSession({token: 'test-token'}),
      settings: {},
      timezones: {get},
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      const {data} = useGetTimezones();
      return <div data-testid="timezone">{data?.[0]?.name}</div>;
    };

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('timezone')).toHaveTextContent('UTC');
    });

    expect(get).toHaveBeenCalledWith();
  });

  test('should not fetch when disabled or without a token', () => {
    const get = testing.fn();
    const gmp = {
      session: createSession(),
      settings: {},
      timezones: {get},
    };
    const {render} = rendererWith({gmp, router: true});

    const TestComponent = () => {
      useGetTimezones({enabled: false});
      return <div />;
    };

    render(<TestComponent />);

    expect(get).not.toHaveBeenCalled();
  });
});
