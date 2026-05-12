/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {describe, test, expect, beforeEach} from '@gsa/testing';
import {screen, rendererWith, wait} from 'web/testing';
import {createMemoryRouter, RouterProvider} from 'react-router';
import {createSession} from 'gmp/testing';
import LoginPageRoute from 'web/pages/login/LoginPageRoute';
import {LocationDisplay} from 'web/testing/Components';

const createGmp = ({
  isLoggedIn = () => true,
  username = 'foo',
}: {
  isLoggedIn?: () => boolean;
  username?: string;
} = {}) => ({
  session: createSession({username, isLoggedIn}),
  settings: {},
  user: {
    currentSettings: () =>
      Promise.resolve({
        data: {
          userinterfacetimeformat: {value: '24h'},
          userinterfacedateformat: {value: 'YYYY-MM-DD'},
        },
      }),
  },
});

const renderWithDataRouter = (gmp: Record<string, unknown>) => {
  const router = createMemoryRouter(
    [
      {path: '/login', element: <LoginPageRoute />},
      {path: '*', element: <LocationDisplay />},
    ],
    {initialEntries: ['/login']},
  );
  const {render} = rendererWith({gmp, router: false});
  render(<RouterProvider router={router} />);
};

describe('LoginPageRoute tests', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('should redirect to /dashboards when logged in with no saved page', async () => {
    const gmp = createGmp();
    renderWithDataRouter(gmp);

    expect(await screen.findByTestId('location-pathname')).toHaveTextContent(
      '/dashboards',
    );
  });

  test('should redirect to last visited page when logged in', async () => {
    sessionStorage.setItem('gsa_last_visited_page_foo', '/tasks?filter=open');

    const gmp = createGmp();
    renderWithDataRouter(gmp);

    expect(await screen.findByTestId('location-pathname')).toHaveTextContent(
      '/tasks',
    );
    expect(screen.getByTestId('location-search')).toHaveTextContent(
      '?filter=open',
    );
  });

  test('should clear last visited page after redirect', () => {
    sessionStorage.setItem('gsa_last_visited_page_foo', '/tasks');

    const gmp = createGmp();
    renderWithDataRouter(gmp);

    expect(sessionStorage.getItem('gsa_last_visited_page_foo')).toBeNull();
  });

  test('should redirect to /dashboards when saved page is /login', async () => {
    sessionStorage.setItem('gsa_last_visited_page_foo', '/login');

    const gmp = createGmp();
    renderWithDataRouter(gmp);

    expect(await screen.findByTestId('location-pathname')).toHaveTextContent(
      '/dashboards',
    );
  });

  test('should not use another users saved page', async () => {
    sessionStorage.setItem('gsa_last_visited_page_alice', '/agents');

    const gmp = createGmp({username: 'bob'});
    renderWithDataRouter(gmp);

    expect(await screen.findByTestId('location-pathname')).toHaveTextContent(
      '/dashboards',
    );
    expect(sessionStorage.getItem('gsa_last_visited_page_alice')).toBe(
      '/agents',
    );
  });

  test('should render login page when not logged in', async () => {
    const gmp = createGmp({isLoggedIn: () => false});
    renderWithDataRouter(gmp);

    expect(await screen.findByTestId('login-button')).toBeInTheDocument();
    await wait();
  });
});
