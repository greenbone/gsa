/* Copyright (C) 2016-2019 Greenbone Networks GmbH
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
import React from 'react';

import {Provider as StoreProvider} from 'react-redux';

import Gmp from 'gmp';
import GmpSettings from 'gmp/gmpsettings';

import {LOG_LEVEL_DEBUG} from 'gmp/log';

import {_, initLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import ErrorBoundary from 'web/components/error/errorboundary';

import LocaleObserver from 'web/components/observer/localeobserver';

import GmpProvider from 'web/components/provider/gmpprovider';

import {
  setUsername,
  setTimezone,
  setIsLoggedIn,
} from 'web/store/usersettings/actions';

import globalcss from 'web/utils/globalcss';

import configureStore from './store';

import {clearStore} from './store/actions';

import Routes from './routes';

initLocale();

const settings = new GmpSettings(global.localStorage, global.config);
const gmp = new Gmp(settings);

const store = configureStore(settings.loglevel === LOG_LEVEL_DEBUG);

window.gmp = gmp;

globalcss();

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
      <ErrorBoundary message={_('An error occurred on this page')}>
        <GmpProvider gmp={gmp}>
          <StoreProvider store={store}>
            <LocaleObserver>
              <Routes />
            </LocaleObserver>
          </StoreProvider>
        </GmpProvider>
      </ErrorBoundary>
    );
  }
}

export default App;

// vim: set ts=2 sw=2 tw=80:
