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
  const {
    container: rtlContainer,
    baseElement,
    rerender,
  } = reactTestingRender(<Main>{ui}</Main>);

  const container = rtlContainer.querySelector<HTMLElement>(
    '[data-testid="main-container"]',
  ) as HTMLElement;
  return {
    userEvent: userEvent.setup({
      pointerEventsCheck: PointerEventsCheckLevel.Never,
    }),
    baseElement,
    baseContainer: rtlContainer,
    container,
    element: container?.firstChild as HTMLElement,
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

export const rendererWithComponent =
  (Component: React.ComponentType<{children: React.ReactNode}>) =>
  (options: RendererOptions = {}) => {
    const {render, ...other} = rendererWith(options);
    return {
      ...other,
      render: (element: React.ReactNode) => {
        const {rerender, ...rest} = render(<Component>{element}</Component>);
        return {
          rerender: (updatedElement: React.ReactNode) =>
            rerender(<Component>{updatedElement}</Component>),
          ...rest,
        };
      },
    };
  };

export const rendererWithTable = rendererWithComponent(({children}) => (
  <table>{children}</table>
));

export const rendererWithTableBody = rendererWithComponent(({children}) => (
  <table>
    <tbody>{children}</tbody>
  </table>
));

export const rendererWithTableRow = rendererWithComponent(({children}) => (
  <table>
    <tbody>
      <tr>{children}</tr>
    </tbody>
  </table>
));

export const rendererWithTableHeader = rendererWithComponent(({children}) => (
  <table>
    <thead>{children}</thead>
  </table>
));
