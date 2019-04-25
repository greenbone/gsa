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
import 'jest-dom/extend-expect';

import React from 'react';

import {
  render as reactTestingRender,
  cleanup,
  queryAllByAttribute,
  getElementError,
} from 'react-testing-library';

import {Router} from 'react-router-dom';

import {Provider} from 'react-redux';

import {createMemoryHistory} from 'history';

import EverythingCapabilities from 'gmp/capabilities/everything';

import {hasValue, isDefined} from 'gmp/utils/identity';

import GmpProvider from 'web/components/provider/gmpprovider';
import CapabilitiesProvider from 'web/components/provider/capabilitiesprovider';

import {createQueryHistory} from 'web/routes';
import configureStore from 'web/store';

export * from 'react-testing-library';

afterEach(cleanup);

const queryAllByName = (container, name) =>
  queryAllByAttribute('name', container, name);

const queryByName = (container, name) => {
  const elements = queryAllByName(container, name);
  if (!elements.length) {
    return null;
  }
  return elements[0];
};

const getByName = (container, name) => {
  const elements = queryAllByName(container, name);
  if (!elements.length) {
    throw getElementError(
      `Unable to find an element with the name: ${name}.`,
      container,
    );
  }
  return elements[0];
};

export const render = ui => {
  const {container, baseElement, ...other} = reactTestingRender(ui);
  return {
    baseElement,
    container,
    element: hasValue(container) ? container.firstChild : undefined,
    getByName: name => getByName(baseElement, name),
    queryByName: name => queryByName(baseElement, name),
    queryAllByName: name => queryAllByName(baseElement, name),
    ...other,
  };
};

const withProvider = name => Component => ({children, ...props}) =>
  isDefined(props[name]) ? (
    <Component {...{[name]: props[name]}}>{children}</Component>
  ) : (
    children
  );

const TestingGmpPropvider = withProvider('gmp')(GmpProvider);
const TestingStoreProvider = withProvider('store')(Provider);
const TestingRouter = withProvider('history')(Router);
const TestingCapabilitiesProvider = withProvider('capabilities')(
  CapabilitiesProvider,
);

export const rendererWith = (
  {capabilities, gmp, store, router} = {
    store: true,
    router: true,
  },
) => {
  if (store === true) {
    store = configureStore();
  }

  let history;
  if (router === true) {
    history = createQueryHistory(createMemoryHistory({initialEntries: ['/']}));
  }

  if (capabilities === true) {
    capabilities = new EverythingCapabilities();
  }
  return {
    render: ui =>
      render(
        <TestingGmpPropvider gmp={gmp}>
          <TestingCapabilitiesProvider capabilities={capabilities}>
            <TestingStoreProvider store={store}>
              <TestingRouter history={history}>{ui}</TestingRouter>
            </TestingStoreProvider>
          </TestingCapabilitiesProvider>
        </TestingGmpPropvider>,
      ),
    gmp,
    store,
    history,
  };
};

// vim: set ts=2 sw=2 tw=80:
