/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 Greenbone Networks GmbH
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
import ReactDOM from 'react-dom';

import {Router, Route, IndexRoute, Redirect, browserHistory
} from 'react-router';

import Gmp from '../gmp/gmp.js';
import {HttpInterceptor} from '../gmp/http.js';

import {is_defined, get_severity_levels} from '../utils.js';
import _ from '../locale.js';

import Login from './login.js';
import Main from './main.js';
import Home from './home.js';
import Task from './tasks/task.js';
import Tasks from './tasks/tasks.js';
import ScansDashboard from './dashboard/scans.js';
import AssetsDashboard from './dashboard/assets.js';
import SecinfoDashboard from './dashboard/secinfo.js';

import './css/gsa-base.css';

const gmp = new Gmp(window.config);

function is_logged_in(next_state, replace) {
  if (!gmp.token && !sessionStorage.token) {
    replace({
      pathname: '/login',
      state: {
        next: next_state.location.pathname
      }
    });
  }
}

if (!is_defined(window.gsa)) {
  window.gsa = {};
}

if (!is_defined(window.gsa._)) {
  window.gsa._ = _;
}

if (!is_defined(window.gsa.severity_levels)) {
  window.gsa.severity_levels = get_severity_levels(); // TODO pass type
}

class AppHttpInterceptor extends HttpInterceptor {

  constructor(app) {
    super();
    this.app = app;
  }

  responseError(xhr) {
    if (xhr.status === 401) {
      this.app.toLoginPage();
    }
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);

    gmp.addInterceptor(new AppHttpInterceptor(this));
    window.gsa.token = gmp.token;
  }

  getChildContext() {
    return {gmp: gmp};
  }

  toLoginPage() {
    gmp.token = undefined;
    this.context.router.replace({
      pathname: '/login',
      state: {
        next: this.props.location.pathname,
      }
    });
  }

  render() {
    return (
      <div>{this.props.children}</div>
    );
  }
}

const PageNotFound = () => {
  return (
    <div>
      <h1>{_('Page Not Found.')}</h1>
    </div>
  );
};

App.childContextTypes = {
  gmp: React.PropTypes.object,
};

App.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

ReactDOM.render(
  <Router history={browserHistory}>
    <Route component={App}>
      <Route path="/login" component={Login}/>
      <Route path="/ng/login" component={Login}/>
      <Route path="/ng" component={Main}>
        <IndexRoute component={Home} onEnter={is_logged_in}/>
        <Route path="tasks" component={Tasks} onEnter={is_logged_in}/>
        <Route path="tasks/:id" component={Task} onEnter={is_logged_in}/>
        <Route path="dashboards/scans" component={ScansDashboard}
          onEnter={is_logged_in}/>
        <Route path="dashboards/assets" component={AssetsDashboard}
          onEnter={is_logged_in}/>
        <Route path="dashboards/secinfo" component={SecinfoDashboard}
          onEnter={is_logged_in}/>
      </Route>
    </Route>
    <Redirect from="/" to="/ng"/>
    <Route path="*" component={PageNotFound} />
  </Router>,
  document.getElementById('app')
);

export default App;

// vim: set ts=2 sw=2 tw=80:
