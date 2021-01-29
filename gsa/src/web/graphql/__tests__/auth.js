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

import React from 'react';

import {rendererWith, screen, wait, fireEvent} from 'web/utils/testing';

import {useIsAuthenticated, useLazyIsAuthenticated, useLogin} from '../auth';
import {
  createIsAuthenticatedQueryMock,
  createIsAuthenticatedQueryErrorMock,
  createLoginQueryMock,
  createLoginQueryErrorMock,
} from '../__mocks__/auth';

const TestUseIsAuthenticated = () => {
  const {isAuthenticated, loading, error} = useIsAuthenticated();
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {error && <span data-testid="error">{error.message}</span>}
      <div data-testid="is-authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
    </div>
  );
};

const TestUseLazyIsAuthenticated = () => {
  const [
    getIsAuthenticated,
    {isAuthenticated, loading, error, called},
  ] = useLazyIsAuthenticated();
  if (loading) {
    return <span data-testid="loading">Loading</span>;
  }
  return (
    <div>
      {!called && <span data-testid="not-called">Not called yet</span>}
      {error && <span data-testid="error">{error.message}</span>}
      <div data-testid="is-authenticated">{isAuthenticated ? 'yes' : 'no'}</div>
      <button data-testid="query" onClick={getIsAuthenticated} />
    </div>
  );
};

describe('useIsAuthenticated tests', () => {
  test('should load authentication status', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestUseIsAuthenticated />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
  });

  test('should provide not authenticated status', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock(false);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestUseIsAuthenticated />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
  });

  test('should handle error while requesting authentication status', async () => {
    const [mock] = createIsAuthenticatedQueryErrorMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestUseIsAuthenticated />);

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    await wait();

    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
  });
});

describe('useLazyIsAuthenticated tests', () => {
  test('should load authentication status', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestUseLazyIsAuthenticated />);

    expect(screen.getByTestId('not-called')).toBeInTheDocument();

    const button = screen.getByTestId('query');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('yes');
  });

  test('should provide not authenticated status', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock(false);
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestUseLazyIsAuthenticated />);

    expect(screen.getByTestId('not-called')).toBeInTheDocument();

    const button = screen.getByTestId('query');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
  });

  test('should handle error while requesting authentication status', async () => {
    const [mock] = createIsAuthenticatedQueryErrorMock();
    const {render} = rendererWith({queryMocks: [mock]});

    render(<TestUseLazyIsAuthenticated />);

    expect(screen.getByTestId('not-called')).toBeInTheDocument();

    const button = screen.getByTestId('query');
    fireEvent.click(button);

    const loading = await screen.findByTestId('loading');
    expect(loading).toHaveTextContent('Loading');

    await wait();

    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByTestId('is-authenticated')).toHaveTextContent('no');
  });
});

const TestLogin = () => {
  const [login, {locale, called, error}] = useLogin();
  return (
    <div>
      {!called && <div data-testid="not-called" />}
      {locale && <div data-testid="locale">{locale}</div>}
      {error && <div data-testid="error">{error.message}</div>}
      <button
        data-testid="login"
        onClick={() => login({username: 'foo', password: 'bar'}).catch(e => {})}
      />
    </div>
  );
};

describe('useLogin tests', () => {
  test('should allow to login a user', async () => {
    const [queryMock, resultFunc] = createLoginQueryMock({
      username: 'foo',
      password: 'bar',
      locale: 'en',
    });
    const {render} = rendererWith({store: true, queryMocks: [queryMock]});

    render(<TestLogin />);

    expect(screen.getByTestId('not-called')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('login'));

    await wait();

    expect(resultFunc).toHaveBeenCalled();

    expect(screen.queryByTestId('not-called')).not.toBeInTheDocument();
    expect(screen.queryByTestId('locale')).toHaveTextContent('en');
  });

  test('should show error if login was not successful', async () => {
    const [queryMock] = createLoginQueryErrorMock({
      username: 'foo',
      password: 'bar',
    });
    const {render} = rendererWith({store: true, queryMocks: [queryMock]});

    render(<TestLogin />);

    expect(screen.getByTestId('not-called')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('login'));

    await wait();

    expect(screen.queryByTestId('not-called')).not.toBeInTheDocument();
    expect(screen.queryByTestId('locale')).not.toBeInTheDocument();

    expect(screen.queryByTestId('error')).toHaveTextContent(
      'An error has occurred.',
    );
  });
});
