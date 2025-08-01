/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {afterEach} from '@gsa/testing';
import {
  render as reactTestingRender,
  cleanup,
  renderHook as rtlRenderHook,
} from '@testing-library/react/pure';
import {InitialEntry, MemoryRouter} from 'react-router';
import {Store} from 'redux';
import Capabilities from 'gmp/capabilities/capabilities';
import EverythingCapabilities from 'gmp/capabilities/everything';
import configureStore from 'web/store';
import {
  LocationDisplay,
  Main,
  TestingCapabilitiesProvider,
  TestingGmpProvider,
  TestingLanguageProvider,
  TestingLicenseProvider,
  TestingStoreProvider,
} from 'web/testing/Components';
import {userEvent, PointerEventsCheckLevel} from 'web/testing/event';

export interface RendererOptions {
  capabilities?: Capabilities | true;
  gmp?: Record<string, unknown>;
  store?: Store | boolean;
  license?: Record<string, unknown>;
  router?: boolean;
  route?: InitialEntry;
  showLocation?: boolean;
  language?: string | Record<string, unknown>;
}

export {renderHook} from '@testing-library/react/pure';

afterEach(cleanup);

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

export const rendererWith = ({
  capabilities,
  gmp,
  license,
  store = true,
  router = true,
  route = '/',
  showLocation = false,
  language = 'en',
}: RendererOptions = {}) => {
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
    store: (store ?? {}) as Store,
    renderHook: <Result, Props>(hook: (initialProps: Props) => Result) =>
      rtlRenderHook<Result, Props>(hook, {wrapper}),
  };
};

export const rendererWithTable = (options: RendererOptions = {}) => {
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

export const rendererWithTableRow = (options: RendererOptions = {}) => {
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

export const rendererWithTableFooter = (options: RendererOptions = {}) => {
  const {render, ...other} = rendererWith(options);
  return {
    ...other,
    render: (element: React.ReactNode) => render(<table>{element}</table>),
  };
};
