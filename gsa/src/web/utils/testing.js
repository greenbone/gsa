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

import {hasValue} from 'gmp/utils/identity';

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

export const rendererWithRouter = (
  history = createMemoryHistory({initialEntries: ['/']}),
) => ({
  render: ui => render(
    <Router history={history}>{ui}</Router>
  ),
  history,
});

export const rendererWithStore = (store = configureStore()) => ({
  render: ui => render(
    <Provider store={store}>{ui}</Provider>
  ),
  store,
});

export const rendererWithStoreAndRouter = (
  store = configureStore(),
  history = createMemoryHistory({initialEntries: ['/']}),
) => ({
  store,
  history,
  render: ui => render(
    <Provider store={store}>
      <Router history={history}>
        {ui}
      </Router>
    </Provider>
  ),
});

// vim: set ts=2 sw=2 tw=80:
