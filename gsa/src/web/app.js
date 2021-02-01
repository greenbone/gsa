/* Copyright (C) 2016-2021 Greenbone Networks GmbH
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
import React from 'react';

import {Provider as StoreProvider} from 'react-redux';

import {ApolloProvider, ApolloClient, createHttpLink} from '@apollo/client';
import {onError} from '@apollo/client/link/error';
import {InMemoryCache} from '@apollo/client/cache';

import Gmp from 'gmp';
import GmpSettings from 'gmp/gmpsettings';

import {buildServerUrl} from 'gmp/http/utils';

import {LOG_LEVEL_DEBUG} from 'gmp/log';

import {_, initLocale} from 'gmp/locale/lang';

import {isDefined} from 'gmp/utils/identity';

import ErrorBoundary from 'web/components/error/errorboundary';

import GlobalStyles from 'web/components/layout/globalstyles';

import LocaleObserver from 'web/components/observer/localeobserver';

import GmpContext from 'web/components/provider/gmpprovider';

import {setUsername, setTimezone} from 'web/store/usersettings/actions';

import configureStore from './store';

import {clearStore} from './store/actions';

import Routes from './routes';

initLocale();

const settings = new GmpSettings(global.localStorage, global.config);
const gmp = new Gmp(settings);

const store = configureStore(
  isDefined(settings.enableStoreDebugLog)
    ? settings.enableStoreDebugLog
    : settings.logLevel === LOG_LEVEL_DEBUG,
);

window.gmp = gmp;

const httpLink = createHttpLink({
  uri: buildServerUrl(
    settings.graphqlApiServer,
    settings.graphqlApiLocation,
    settings.graphqlApiProtocol,
  ),
  credentials: 'include',
});

const initStore = () => {
  const {timezone, username} = gmp.settings;

  if (isDefined(timezone)) {
    store.dispatch(setTimezone(timezone));
  }
  if (isDefined(username)) {
    store.dispatch(setUsername(username));
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);

    this.handlePostLogout = this.handlePostLogout.bind(this);
    this.handleGmpErrorResponse = this.handleGmpErrorResponse.bind(this);

    const logoutLink = onError(({networkError}) => {
      if (networkError?.statusCode === 401) {
        this.logout();
      }
    });

    this.client = new ApolloClient({
      link: logoutLink.concat(httpLink),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: {
          /* Apollo's cache-and-network fetch policy is used to have quick
            listings and then update data.
            - When a query is send, Apollo checks for the data in the cache
            - If data is in cache, return cached data
            - Pass another query to get up-to-date data (irrespective if data
              was already cached or not)
            - Update cache with new data
            - Return updated query data
          */
          fetchPolicy: 'cache-and-network',
        },
      },
    });
  }

  componentDidMount() {
    this.unsubscribeFromLogout = gmp.subscribeToLogout(this.handlePostLogout);
    this.unsubscribeFromErrorHandler = gmp.addHttpErrorHandler(
      this.handleGmpErrorResponse,
    );

    initStore();
  }

  componentWillUnmount() {
    if (isDefined(this.unsubscribeFromLogout)) {
      this.unsubscribeFromLogout();
    }
    if (isDefined(this.unsubscribeFromErrorHandler)) {
      this.unsubscribeFromErrorHandler();
    }
  }

  handleGmpErrorResponse(xhr) {
    if (xhr.status === 401) {
      this.logout();
    }
    return Promise.reject(xhr);
  }

  logout() {
    gmp.logout();
  }

  handlePostLogout() {
    // clear Apollo cache
    this.client.clearStore();
    // cleanup redux store
    clearStore(store.dispatch);
  }

  render() {
    return (
      <React.Fragment>
        <GlobalStyles />
        <ErrorBoundary message={_('An error occurred on this page')}>
          <ApolloProvider client={this.client}>
            <GmpContext.Provider value={gmp}>
              <StoreProvider store={store}>
                <LocaleObserver>
                  <Routes />
                </LocaleObserver>
              </StoreProvider>
            </GmpContext.Provider>
          </ApolloProvider>
        </ErrorBoundary>
      </React.Fragment>
    );
  }
}

export default App;

// vim: set ts=2 sw=2 tw=80:
