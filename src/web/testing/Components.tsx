/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {ThemeProvider} from '@greenbone/opensight-ui-components-mantinev7';
import {Provider as StoreProvider} from 'react-redux';
import {useLocation} from 'react-router';
import {StyleSheetManager} from 'styled-components';
import {DEFAULT_LANGUAGE, getLocale} from 'gmp/locale/lang';
import {isDefined} from 'gmp/utils/identity';
import CapabilitiesContext from 'web/components/provider/CapabilitiesProvider';
import GmpContext from 'web/components/provider/GmpProvider';
import {LanguageContext} from 'web/components/provider/LanguageProvider';
import LicenseProvider from 'web/components/provider/LicenseProvider';

export const Main = ({children}: {children: React.ReactNode}) => {
  return (
    <ThemeProvider defaultColorScheme="light">
      <StyleSheetManager enableVendorPrefixes>
        <div data-testid="main-container">{children}</div>
      </StyleSheetManager>
    </ThemeProvider>
  );
};

export const LocationDisplay = () => {
  const location = useLocation();

  return (
    <div>
      <div data-testid="location-pathname">{location.pathname}</div>
      <div data-testid="location-search">{location.search}</div>
      <div data-testid="location-hash">{location.hash}</div>
    </div>
  );
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

export const TestingGmpProvider = withProvider(
  'gmp',
  'value',
)(GmpContext.Provider);
export const TestingStoreProvider = withProvider('store')(StoreProvider);
export const TestingCapabilitiesProvider = withProvider(
  'capabilities',
  'value',
)(CapabilitiesContext.Provider);
export const TestingLicenseProvider = withProvider(
  'license',
  'value',
)(LicenseProvider);

// Mock LanguageProvider that doesn't use GMP
export const TestingLanguageProvider = ({
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
