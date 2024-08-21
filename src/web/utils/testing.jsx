/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/* eslint-disable react/prop-types */

import {afterEach} from '@gsa/testing';

// jest-styled-components provides expect.toHaveStyleRule and snapshots for styled-components
// it requires global.beforeEach and expect
import 'jest-styled-components';

import React from 'react';

import {
  act,
  render as reactTestingRender,
  cleanup,
  queryAllByAttribute,
  getElementError,
  within,
  renderHook,
} from '@testing-library/react/pure';
import userEvent from '@testing-library/user-event';

import {Router} from 'react-router-dom';

import {Provider} from 'react-redux';

import {createMemoryHistory} from 'history';

import EverythingCapabilities from 'gmp/capabilities/everything';

import {hasValue, isDefined} from 'gmp/utils/identity';

import GmpContext from 'web/components/provider/gmpprovider';
import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';
import LicenseProvider from 'web/components/provider/licenseprovider';

import {createQueryHistory} from 'web/routes';
import configureStore from 'web/store';
import {StyleSheetManager} from 'styled-components';

export * from '@testing-library/react/pure';
export {userEvent};

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
  const {container, baseElement, rerender, ...other} = reactTestingRender(
    <StyleSheetManager enableVendorPrefixes>{ui}</StyleSheetManager>,
  );
  return {
    baseElement,
    container,
    element: hasValue(container) ? container.firstChild : undefined,
    getAllByName: name => getAllByName(baseElement, name),
    getByName: name => getByName(baseElement, name),
    queryByName: name => queryByName(baseElement, name),
    queryAllByName: name => queryAllByName(baseElement, name),
    within: () => within(baseElement),
    renderHook: hook => renderHook(hook, {wrapper: ui}),
    rerender: component =>
      rerender(
        <StyleSheetManager enableVendorPrefixes>{component}</StyleSheetManager>,
      ),
    ...other,
  };
};

const withProvider =
  (name, key = name) =>
  Component =>
  ({children, ...props}) =>
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
const TestingLicenseProvider = withProvider(
  'license',
  'value',
)(LicenseProvider);

export const rendererWith = (
  {capabilities, gmp, license, store, router} = {
    store: true,
    router: true,
  },
) => {
  if (store === true) {
    store = configureStore({testing: true});
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
            <TestingLicenseProvider license={license}>
              <TestingStoreProvider store={store}>
                <TestingRouter history={history}>{ui}</TestingRouter>
              </TestingStoreProvider>
            </TestingLicenseProvider>
          </TestingCapabilitiesProvider>
        </TestingGmpProvider>,
      ),
    gmp,
    store,
    history,
  };
};

// vim: set ts=2 sw=2 tw=80:
