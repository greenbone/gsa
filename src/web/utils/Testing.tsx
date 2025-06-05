/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

// jest-styled-components provides expect.toHaveStyleRule and snapshots for styled-components
// it requires global.beforeEach and expect
import 'jest-styled-components';

import {ThemeProvider} from '@greenbone/opensight-ui-components-mantinev7';
import {afterEach} from '@gsa/testing';
import {
  act,
  render as reactTestingRender,
  cleanup,
  renderHook as rtlRenderHook,
} from '@testing-library/react/pure';
import userEvent, {PointerEventsCheckLevel} from '@testing-library/user-event';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import {DEFAULT_LANGUAGE, getLocale} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import {Provider} from 'react-redux';
import {MemoryRouter, useLocation} from 'react-router';
import {Store} from 'redux';
import {StyleSheetManager} from 'styled-components';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import GmpContext from 'web/components/provider/GmpProvider';
import {LanguageContext} from 'web/components/provider/LanguageProvider';
import LicenseProvider from 'web/components/provider/LicenseProvider';
import configureStore from 'web/store';

export {
  renderHook,
  waitFor,
  act,
  screen,
  fireEvent,
} from '@testing-library/react/pure';
export {userEvent};

afterEach(cleanup);

interface RendererOptions {
  capabilities?: Capabilities | true;
  gmp?: Record<string, unknown>;
  store?: Store | boolean;
  license?: Record<string, unknown>;
  router?: boolean;
  route?: string;
  showLocation?: boolean;
  language?: string | Record<string, unknown>;
}

export async function wait(ms: number = 0) {
  await act(
    () =>
      new Promise(resolve => {
        setTimeout(resolve, ms);
      }),
  );
}

const Main = ({children}: {children: React.ReactNode}) => {
  return (
    <ThemeProvider defaultColorScheme="light">
      <StyleSheetManager enableVendorPrefixes>{children}</StyleSheetManager>
    </ThemeProvider>
  );
};

export const render = (ui: React.ReactNode) => {
  const {container, baseElement, rerender} = reactTestingRender(
    <Main>{ui}</Main>,
  );

  return {
    userEvent: userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    }),
    baseElement,
    container,
    element: container.lastChild as HTMLElement,
    rerender: (component: React.ReactNode) =>
      rerender(<Main>{component}</Main>),
  };
};

const withProvider =
  (name: string, key: string = name) =>
  (Component: React.ElementType) =>
  ({children, ...props}: {children: React.ReactNode; [key: string]: unknown}) =>
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

// Mock LanguageProvider that doesn't use GMP
const TestingLanguageProvider = ({
  children,
  language,
}: {
  children: React.ReactNode;
  language?: Record<string, unknown>;
}) => {
  // Use provided object or default
  const languageValue = language || {
    language: getLocale() ?? DEFAULT_LANGUAGE,
    setLanguage: async () => {},
  };

  // Ensure we have required properties with correct types
  const value = {
    language:
      (languageValue.language as string) ?? getLocale() ?? DEFAULT_LANGUAGE,
    setLanguage:
      (languageValue.setLanguage as (lang: string) => Promise<void>) ??
      (async () => {}),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const rendererWith = (
  {
    capabilities,
    gmp,
    license,
    store = true,
    router,
    route = '/',
    showLocation = false,
    language = 'en',
  }: RendererOptions = {
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

  const LocationDisplay = () => {
    const location = useLocation();

    return (
      <div>
        <div data-testid="location-pathname">{location.pathname}</div>
        <div data-testid="location-search">{location.search}</div>
        <div data-testid="location-hash">{location.hash}</div>
      </div>
    );
  };

  const Providers = ({children}) => (
    <TestingGmpProvider gmp={gmp}>
      <TestingCapabilitiesProvider capabilities={capabilities}>
        <TestingLicenseProvider license={license}>
          <TestingStoreProvider store={store}>
            <TestingLanguageProvider
              language={typeof language === 'string' ? {language} : language}
            >
              {router ? (
                <MemoryRouter initialEntries={[route]}>
                  {children}
                  {showLocation && <LocationDisplay />}
                </MemoryRouter>
              ) : (
                children
              )}
            </TestingLanguageProvider>
          </TestingStoreProvider>
        </TestingLicenseProvider>
      </TestingCapabilitiesProvider>
    </TestingGmpProvider>
  );

  const wrapper = ({children}: {children: React.ReactNode}) => (
    <Providers>{children}</Providers>
  );

  return {
    render: (ui: React.ReactNode) => {
      const {rerender, ...other} = render(<Providers>{ui}</Providers>);
      return {
        ...other,
        rerender: (updatedUi: React.ReactNode) =>
          rerender(<Providers>{updatedUi}</Providers>),
      };
    },
    gmp,
    store,
    renderHook: <Result, Props>(hook: (initialProps: Props) => Result) =>
      rtlRenderHook<Result, Props>(hook, {wrapper}),
  };
};

export const rendererWithTable = (options: RendererOptions) => {
  const {render, ...other} = rendererWith(options);
  return {
    ...other,
    render: (element: React.ReactNode) =>
      render(
        <table>
          <tbody>{element}</tbody>
        </table>,
      ),
  };
};

export const rendererWithTableRow = (options: RendererOptions) => {
  const {render, ...other} = rendererWith(options);
  return {
    ...other,
    render: (element: React.ReactNode) =>
      render(
        <table>
          <tbody>
            <tr>{element}</tr>
          </tbody>
        </table>,
      ),
  };
};

export const rendererWithTableFooter = (options: RendererOptions) => {
  const {render, ...other} = rendererWith(options);
  return {
    ...other,
    render: (element: React.ReactNode) => render(<table>{element}</table>),
  };
};
