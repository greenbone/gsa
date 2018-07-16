/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 * Steffen Waterkamp <steffen.waterkamp@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2018 Greenbone Networks GmbH
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
import CacheFactory from 'gmp/cache';
import {subscribe} from 'gmp/locale/lang';
import {is_defined} from 'gmp/utils/identity';

import CacheFactoryProvider from './components/provider/cachefactoryprovider';
import GmpProvider from './components/provider/gmpprovider';

import globalcss from './utils/globalcss';

import configureStore from './store';

import {clearStore} from './store/actions';

import Routes from './routes';

const {config = {}} = window;

const caches = new CacheFactory();

const gmp = new Gmp(config);

const store = configureStore();

window.gmp = gmp;

globalcss({
  'html, body, #app, #app > div': {
    height: '100%',
  },
});

class App extends React.Component {

  constructor(props) {
    super(props);

    this.renderOnLanguageChange = this.renderOnLanguageChange.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    this.unsubscribeFromLanguageChange = subscribe(this.renderOnLanguageChange);
    this.unsubscribeFromLogout = gmp.subscribeToLogout(this.handleLogout);
  }

  componentWillUnmount() {
    if (is_defined(this.unsubscribeFromLanguageChange)) {
      this.unsubscribeFromLanguageChange();
    }

    if (is_defined(this.unsubscribeFromLogout)) {
      this.unsubscribeFromLogout();
    }
  }

  renderOnLanguageChange() {
    this.forceUpdate();
  }

  handleLogout() {
    // cleanup store
    clearStore(store.dispatch);
    // cleanup cache
    caches.clearAll();
  }

  render() {
    return (
      <GmpProvider gmp={gmp}>
        <CacheFactoryProvider caches={caches}>
          <StoreProvider store={store}>
            <Routes />
          </StoreProvider>
        </CacheFactoryProvider>
      </GmpProvider>
    );
  }
}

export default App;

// vim: set ts=2 sw=2 tw=80:
