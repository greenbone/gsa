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
import React from 'react';

import date from 'gmp/models/date';

import {
  createIsAuthenticatedQueryMock,
  createIsAuthenticatedQueryErrorMock,
} from 'web/graphql/__mocks__/auth';
import {createRenewSessionQueryMock} from 'web/graphql/__mocks__/session';

import {rendererWith, screen, wait} from 'web/utils/testing';

import Authorized from '../authorized';

describe('Authorized tests', () => {
  test('should load authentication status', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock();
    const subscribeToLogout = jest.fn();
    const renewDate = date('2020-03-20');
    const [
      renewSessionMock,
      renewSessionResultFunc,
    ] = createRenewSessionQueryMock(renewDate);
    const renewSession = jest
      .fn()
      .mockReturnValue(Promise.resolve({data: renewDate}));
    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
      subscribeToLogout,
      user: {
        renewSession,
      },
    };
    const {render} = rendererWith({
      queryMocks: [mock, renewSessionMock],
      store: true,
      gmp,
      router: true,
    });

    render(
      <Authorized>
        <div data-testid="child" />
      </Authorized>,
    );

    expect(subscribeToLogout).toHaveBeenCalled();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(renewSessionResultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('child')).toBeInTheDocument();

    expect(renewSession).toHaveBeenCalled();
  });

  test('should redirect to login page if not authenticated', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock(false);
    const subscribeToLogout = jest.fn();
    const renewDate = date('2020-03-20');
    const [
      renewSessionMock,
      renewSessionResultFunc,
    ] = createRenewSessionQueryMock(renewDate);
    const renewSession = jest
      .fn()
      .mockReturnValue(Promise.resolve({data: renewDate}));
    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
      subscribeToLogout,
      user: {
        renewSession,
      },
    };
    const {render, history} = rendererWith({
      queryMocks: [mock, renewSessionMock],
      store: true,
      gmp,
      router: true,
    });

    render(
      <Authorized>
        <div data-testid="child" />
      </Authorized>,
    );

    expect(subscribeToLogout).toHaveBeenCalled();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(renewSessionResultFunc).not.toHaveBeenCalled();

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    expect(renewSession).not.toHaveBeenCalled();

    expect(history.location.pathname).toMatch('/login');
  });

  test('should redirect to login page if an error occurred', async () => {
    const [mock] = createIsAuthenticatedQueryErrorMock();
    const subscribeToLogout = jest.fn();
    const renewDate = date('2020-03-20');
    const [
      renewSessionMock,
      renewSessionResultFunc,
    ] = createRenewSessionQueryMock(renewDate);
    const renewSession = jest
      .fn()
      .mockReturnValue(Promise.resolve({data: renewDate}));
    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
      subscribeToLogout,
      user: {
        renewSession,
      },
    };
    const {render, history} = rendererWith({
      queryMocks: [mock, renewSessionMock],
      store: true,
      gmp,
      router: true,
    });

    render(
      <Authorized>
        <div data-testid="child" />
      </Authorized>,
    );

    expect(subscribeToLogout).toHaveBeenCalled();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(renewSessionResultFunc).not.toHaveBeenCalled();

    expect(screen.queryByTestId('child')).not.toBeInTheDocument();

    expect(renewSession).not.toHaveBeenCalled();

    expect(history.location.pathname).toMatch('/login');
  });

  test('should redirect to login page on logout', async () => {
    const [mock, resultFunc] = createIsAuthenticatedQueryMock();
    let logout;
    const subscribeToLogout = jest.fn(func => (logout = func));
    const renewDate = date('2020-03-20');
    const [
      renewSessionMock,
      renewSessionResultFunc,
    ] = createRenewSessionQueryMock(renewDate);
    const renewSession = jest
      .fn()
      .mockReturnValue(Promise.resolve({data: renewDate}));
    const gmp = {
      settings: {
        enableHyperionOnly: false,
      },
      subscribeToLogout,
      user: {
        renewSession,
      },
    };
    const {render, history} = rendererWith({
      queryMocks: [mock, renewSessionMock],
      store: true,
      gmp,
      router: true,
    });

    render(
      <Authorized>
        <div data-testid="child" />
      </Authorized>,
    );

    expect(subscribeToLogout).toHaveBeenCalled();

    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await wait();

    expect(resultFunc).toHaveBeenCalled();
    expect(renewSessionResultFunc).toHaveBeenCalled();

    expect(screen.getByTestId('child')).toBeInTheDocument();

    logout();

    await wait();

    expect(history.location.pathname).toMatch('/login');
  });
});
