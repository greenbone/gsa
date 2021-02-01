/* Copyright (C) 2018-2021 Greenbone Networks GmbH
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

import 'jest-styled-components';
import '@testing-library/jest-dom/extend-expect';

import React from 'react';

import {
  act,
  render as reactTestingRender,
  cleanup,
  queryAllByAttribute,
  getElementError,
} from '@testing-library/react';

import {Router} from 'react-router-dom';

import {Provider} from 'react-redux';

import {createMemoryHistory} from 'history';

import EverythingCapabilities from 'gmp/capabilities/everything';

import {hasValue, isDefined} from 'gmp/utils/identity';

import GmpContext from 'web/components/provider/gmpprovider';
import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';

import {createQueryHistory} from 'web/routes';
import configureStore from 'web/store';
import {MockedProvider} from '@apollo/client/testing';

export * from '@testing-library/react';

afterEach(cleanup);

export async function wait(ms = 0) {
  await act(
    () =>
      new Promise(resolve => {
        setTimeout(resolve, ms);
      }),
  );
}

export const queryAllByName = (container, name) =>
  queryAllByAttribute('name', container, name);

export const queryByName = (container, name) => {
  const elements = queryAllByName(container, name);
  if (!elements.length) {
    return null;
  }
  return elements[0];
};

export const getAllByName = (container, name) => {
  const elements = queryAllByName(container, name);
  if (!elements.length) {
    throw getElementError(
      `Unable to find an element with the name: ${name}.`,
      container,
    );
  }
  return elements;
};

export const getByName = (container, name) => {
  const elements = getAllByName(container, name);
  return elements[0];
};

export const render = ui => {
  const {container, baseElement, ...other} = reactTestingRender(ui);
  return {
    baseElement,
    container,
    element: hasValue(container) ? container.firstChild : undefined,
    getAllByName: name => getAllByName(baseElement, name),
    getByName: name => getByName(baseElement, name),
    queryByName: name => queryByName(baseElement, name),
    queryAllByName: name => queryAllByName(baseElement, name),
    ...other,
  };
};

const withProvider = (name, key = name) => Component => ({
  children,
  ...props
}) =>
  isDefined(props[name]) ? (
    <Component {...{[key]: props[name]}}>{children}</Component>
  ) : (
    children
  );

const TestingGmpProvider = withProvider('gmp', 'value')(GmpContext.Provider);
const TestingStoreProvider = withProvider('store')(Provider);
const TestingRouter = withProvider('history')(Router);
const TestingCapabilitiesProvider = withProvider(
  'capabilities',
  'value',
)(CapabilitiesContext.Provider);

export const rendererWith = (
  {capabilities, gmp, store, router, queryMocks} = {
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
        <TestingGmpProvider gmp={gmp}>
          <TestingCapabilitiesProvider capabilities={capabilities}>
            <TestingStoreProvider store={store}>
              <MockedProvider mocks={queryMocks} addTypename={false}>
                <TestingRouter history={history}>{ui}</TestingRouter>
              </MockedProvider>
            </TestingStoreProvider>
          </TestingCapabilitiesProvider>
        </TestingGmpProvider>,
      ),
    gmp,
    store,
    history,
  };
};

export const deepFreeze = object => {
  // Retrieve the property names defined on object
  const propNames = Object.getOwnPropertyNames(object);

  // Freeze properties before freezing self
  for (const name of propNames) {
    const value = object[name];

    if (value && typeof value === 'object') {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
};

export const createGenericQueryMock = (query, result, variables, errors) => {
  let resultFunc;

  if (hasValue(errors)) {
    resultFunc = jest.fn().mockReturnValue({
      data: result,
      errors,
    });
  } else {
    resultFunc = jest.fn().mockReturnValue({
      data: result,
    });
  }

  let queryRequest;

  if (hasValue(variables)) {
    queryRequest = {
      query,
      variables,
    };
  } else {
    queryRequest = {
      query,
    };
  }

  const queryMock = {
    request: queryRequest,
    newData: resultFunc,
  };
  return [queryMock, resultFunc];
};

// vim: set ts=2 sw=2 tw=80:
