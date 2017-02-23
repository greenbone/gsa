/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2016 - 2017 Greenbone Networks GmbH
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

import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';

import {Router, Route, IndexRoute, Redirect, browserHistory
} from 'react-router';

import Gmp from '../gmp/gmp.js';
import {HttpInterceptor} from '../gmp/http.js';
import PromiseFactory from '../gmp/promise.js';

import {is_defined} from '../utils.js';
import _ from '../locale.js';

import AssetsPage from './assetspage.js';
import HomePage from './homepage.js';
import LoginPage from './loginpage.js';
import Page from './page.js';
import PageNotFound from './pagenotfound.js';
import ScansPage from './scanspage.js';
import SecinfoPage from './secinfopage.js';
import {get_severity_levels} from './render.js';

import CertBundAdvsPage from './certbund/certbundadvspage.js';
import CpesPage from './cpes/cpespage.js';
import CvesPage from './cves/cvespage.js';
import DfnCertAdvsPage from './dfncert/dfncertadvspage.js';
import HostsPage from './hosts/hostspage.js';
import NotesPage from './notes/notespage.js';
import NvtsPage from './nvts/nvtspage.js';
import OperatingSystemsPage from './os/operatingsystemspage.js';
import OvaldefsPage from './ovaldefs/ovaldefspage.js';
import OverridesPage from './overrides/overridespage.js';
import ReportsPage from './reports/reportspage.js';
import ResultsPage from './results/resultspage.js';
import TargetsPage from './targets/targetspage.js';
import TasksPage from './tasks/taskspage.js';
import VulnerabilitiesPage from './vulns/vulnspage.js';

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
      return PromiseFactory.resolve(xhr);
    }
    return PromiseFactory.reject(xhr);
  }
}

class App extends React.Component {

  constructor(props) {
    super(props);

    gmp.addHttpInterceptor(new AppHttpInterceptor(this));
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

App.childContextTypes = {
  gmp: React.PropTypes.object,
};

App.contextTypes = {
  router: React.PropTypes.object.isRequired,
};

ReactDOM.render(
  <Router history={browserHistory}>
    <Route component={App}>
      <Route path="/login" component={LoginPage}/>
      <Route path="/ng/login" component={LoginPage}/>
      <Route
        path="/ng"
        component={Page}
        onEnter={is_logged_in}>
        <IndexRoute component={HomePage}/>
        <Route
          path="tasks"
          component={TasksPage}/>
        <Route
          path="results"
          component={ResultsPage}/>
        <Route
          path="notes"
          component={NotesPage}/>
        <Route
          path="overrides"
          component={OverridesPage}/>
        <Route
          path="operatingsystems"
          component={OperatingSystemsPage}/>
        <Route
          path="reports"
          component={ReportsPage}/>
        <Route
          path="hosts"
          component={HostsPage}/>
        <Route
          path="targets"
          component={TargetsPage}/>
        <Route
          path="vulnerabilities"
          component={VulnerabilitiesPage}/>
        <Route
          path="nvts"
          component={NvtsPage}/>
        <Route
          path="cves"
          component={CvesPage}/>
        <Route
          path="cpes"
          component={CpesPage}/>
        <Route
          path="ovaldefs"
          component={OvaldefsPage}/>
        <Route
          path="certbundadvs"
          component={CertBundAdvsPage}/>
        <Route
          path="dfncertadvs"
          component={DfnCertAdvsPage}/>
        <Route
          path="dashboards/scans"
          component={ScansPage}/>
        <Route
          path="dashboards/assets"
          component={AssetsPage}/>
        <Route
          path="dashboards/secinfo"
          component={SecinfoPage}/>
      </Route>
      <Redirect from="/" to="/ng"/>
      <Route path="*" component={PageNotFound} />
    </Route>
  </Router>,
  document.getElementById('app')
);

export default App;

// vim: set ts=2 sw=2 tw=80:
