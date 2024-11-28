/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {Provider as StoreProvider} from 'react-redux';

import {
  ThemeProvider,
  theme,
} from '@greenbone/opensight-ui-components-mantinev7';

import Gmp from 'gmp';
import GmpSettings from 'gmp/gmpsettings';

import {LOG_LEVEL_DEBUG} from 'gmp/log';

import {_, initLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import ErrorBoundary from 'web/components/error/errorboundary';

import GlobalStyles from 'web/components/layout/globalstyles';

import LocaleObserver from 'web/components/observer/localeobserver';

import GmpContext from 'web/components/provider/gmpprovider';

import {
  setUsername,
  setTimezone,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';

import configureStore from './store';

import {clearStore} from './store/actions';

import Routes from './routes';

initLocale();

const settings = new GmpSettings(global.localStorage, global.config);
const gmp = new Gmp(settings);

const store = configureStore({
  debug: isDefined(settings.enableStoreDebugLog)
    ? settings.enableStoreDebugLog
    : settings.logLevel === LOG_LEVEL_DEBUG,
});

window.gmp = gmp;

const initStore = () => {
  const {timezone, username} = gmp.settings;

  if (isDefined(timezone)) {
    store.dispatch(setTimezone(timezone));
  }
  if (isDefined(username)) {
    store.dispatch(setUsername(username));
  }
  store.dispatch(setIsLoggedIn(gmp.isLoggedIn()));
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.unsubscribeFromLogout = gmp.subscribeToLogout(this.handleLogout);

    initStore();
  }

  componentWillUnmount() {
    if (isDefined(this.unsubscribeFromLogout)) {
      this.unsubscribeFromLogout();
    }
  }

  handleLogout() {
    // cleanup store
    clearStore(store.dispatch);
  }

  render() {
    return (
      <ThemeProvider theme={{...theme, colorScheme: 'light'}}>
        <GlobalStyles />
        <ErrorBoundary message={_('An error occurred on this page')}>
          <GmpContext.Provider value={gmp}>
            <StoreProvider store={store}>
              <LocaleObserver>
                <Routes />
              </LocaleObserver>
            </StoreProvider>
          </GmpContext.Provider>
        </ErrorBoundary>
      </ThemeProvider>
    );
  }
}

export default App;

// vim: set ts=2 sw=2 tw=80:
