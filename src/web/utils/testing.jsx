/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// jest-styled-components provides expect.toHaveStyleRule and snapshots for styled-components
// it requires global.beforeEach and expect
import 'jest-styled-components';

import {
  ThemeProvider,
  theme,
} from '@greenbone/opensight-ui-components-mantinev7';
import {afterEach} from '@gsa/testing';
import {
  act,
  render as reactTestingRender,
  cleanup,
  queryAllByAttribute,
  getElementError,
  within,
  renderHook as rtlRenderHook,
} from '@testing-library/react/pure';
import userEvent, {PointerEventsCheckLevel} from '@testing-library/user-event';
import EverythingCapabilities from 'gmp/capabilities/everything';
import {hasValue, isDefined} from 'gmp/utils/identity';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router';
import {StyleSheetManager} from 'styled-components';
import CapabilitiesContext from 'web/components/provider/capabilitiesprovider';
import GmpContext from 'web/components/provider/gmpprovider';
import LicenseProvider from 'web/components/provider/licenseprovider';
import configureStore from 'web/store';

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

const Main = ({children}) => {
  return (
    <ThemeProvider theme={{...theme, colorScheme: 'light'}}>
      <StyleSheetManager enableVendorPrefixes>{children}</StyleSheetManager>
    </ThemeProvider>
  );
};

export const render = ui => {
  const {container, baseElement, rerender, ...other} = reactTestingRender(
    <Main>{ui}</Main>,
  );

  return {
    userEvent: userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    }),
    baseElement,
    container,
    element: hasValue(container) ? container.lastChild : undefined,
    getAllByName: name => getAllByName(baseElement, name),
    getByName: name => getByName(baseElement, name),
    queryByName: name => queryByName(baseElement, name),
    queryAllByName: name => queryAllByName(baseElement, name),
    within: () => within(baseElement),
    rerender: component => rerender(<Main>{component}</Main>),
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
const TestingCapabilitiesProvider = withProvider(
  'capabilities',
  'value',
)(CapabilitiesContext.Provider);
const TestingLicenseProvider = withProvider(
  'license',
  'value',
)(LicenseProvider);

export const rendererWith = (
  {capabilities, gmp, license, store = true, router} = {
    store: true,
    router: true,
  },
) => {
  if (store === true) {
    store = configureStore({testing: true});
  }

  if (capabilities === true) {
    capabilities = new EverythingCapabilities();
  }

  const Providers = ({children}) => (
    <TestingGmpProvider gmp={gmp}>
      <TestingCapabilitiesProvider capabilities={capabilities}>
        <TestingLicenseProvider license={license}>
          <TestingStoreProvider store={store}>
            {router ? (
              <BrowserRouter
                future={{
                  // eslint-disable-next-line camelcase
                  v7_startTransition: true,
                  // eslint-disable-next-line camelcase
                  v7_relativeSplatPath: false,
                }}
                initialEntries={['/']}
              >
                {children}
              </BrowserRouter>
            ) : (
              children
            )}
          </TestingStoreProvider>
        </TestingLicenseProvider>
      </TestingCapabilitiesProvider>
    </TestingGmpProvider>
  );

  const wrapper = ({children}) => <Providers>{children}</Providers>;

  return {
    render: ui => render(<Providers>{ui}</Providers>),
    gmp,
    store,
    renderHook: hook => rtlRenderHook(hook, {wrapper}),
  };
};
