/* Copyright (C) 2018 Greenbone Networks GmbH
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
/* eslint-disable react/prop-types */

import 'jest-styled-components';

import React from 'react';

import {render as reactTestingRender} from 'react-testing-library';

import {Router} from 'react-router-dom';

import {Provider} from 'react-redux';

import {createMemoryHistory} from 'history';

import {
  toHaveAttribute,
  toHaveTextContent,
} from 'jest-dom';

import {hasValue, isDefined} from 'gmp/utils/identity';

import GmpProvider from 'web/components/provider/gmpprovider';

import configureStore from 'web/store';

expect.extend({
  toHaveAttribute,
  toHaveTextContent,
});

export * from 'react-testing-library';

export const render = ui => {
  const {container, ...other} = reactTestingRender(ui);
  return {
    container,
    element: hasValue(container) ? container.firstChild : undefined,
    ...other,
  };
};

const withProvider = name => Component => ({children, ...props}) =>
  isDefined(props[name]) ?
    <Component {...{[name]: props[name]}}>
      {children}
    </Component> :
    children;

const TestingGmpPropvider = withProvider('gmp')(GmpProvider);
const TestingStoreProvider = withProvider('store')(Provider);
const TestingRouter = withProvider('history')(Router);

export const rendererWith = ({
  gmp,
  store,
  router,
} = {
  store: true,
  router: true,
}) => {
  if (store === true) {
    store = configureStore();
  }

  let history;
  if (router === true) {
    history = createMemoryHistory({initialEntries: ['/']});
  }
  return {
    render: ui => render(
      <TestingGmpPropvider gmp={gmp}>
        <TestingStoreProvider store={store}>
          <TestingRouter history={history}>
            {ui}
          </TestingRouter>
        </TestingStoreProvider>
      </TestingGmpPropvider>
    ),
    gmp,
    store,
    history,
  };
};

// vim: set ts=2 sw=2 tw=80:
