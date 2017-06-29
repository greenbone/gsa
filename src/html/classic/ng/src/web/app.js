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

import {
  browserHistory,
  IndexRoute,
  Redirect,
  Route,
  Router,
} from 'react-router';

import CacheFactory from 'gmp/cache.js';
import Gmp from 'gmp';
import {HttpInterceptor} from 'gmp/http.js';
import PromiseFactory from 'gmp/promise.js';

import {is_defined} from 'gmp/utils.js';
import _ from 'gmp/locale.js';

import PropTypes from './utils/proptypes.js';

import {get_severity_levels} from './utils/render.js';

import AssetsPage from './pages/assetspage.js';
import HomePage from './pages/homepage.js';
import LoginPage from './pages/loginpage.js';
import Page from './pages/page.js';
import PageNotFound from './pages/notfoundpage.js';
import ScansPage from './pages/scanspage.js';
import SecinfoPage from './pages/secinfopage.js';

import AgentsPage from './agents/agentspage.js';
import AlertsPage from './alerts/alertspage.js';
import AllSecInfosPage from './secinfo/secinfospage.js';
import CertBundAdvsPage from './certbund/certbundadvspage.js';
import CpesPage from './cpes/cpespage.js';
import CredentialsPage from './credentials/credentialspage.js';
import CvesPage from './cves/cvespage.js';
import DfnCertAdvsPage from './dfncert/dfncertadvspage.js';
import FiltersPage from './filters/filterspage.js';
import GroupsPage from './groups/groupsppage.js';
import HostsPage from './hosts/hostspage.js';
import NotesPage from './notes/notespage.js';
import NvtsPage from './nvts/nvtspage.js';
import OperatingSystemsPage from './os/operatingsystemspage.js';
import OvaldefsPage from './ovaldefs/ovaldefspage.js';
import OverridesPage from './overrides/overridespage.js';
import PermissionsPage from './permissions/permissionspage.js';
import PortListsPage from './portlists/portlistspage.js';
import ReportFormatsPage from './reportformats/reportformatspage.js';
import ReportsPage from './reports/reportspage.js';
import ResultsPage from './pages/results/listpage.js';
import ResultDetailsPage from './pages/results/detailspage.js';
import RolesPage from './roles/rolespage.js';
import ScanConfigsPage from './scanconfigs/scanconfigspage.js';
import ScannersPage from './scanners/scannerspage.js';
import SchedulesPage from './schedules/schedulespage.js';
import TagsPage from './tags/tagspage.js';
import TargetsPage from './targets/targetspage.js';
import TasksPage from './pages/tasks/listpage.js';
import UsersPage from './users/userspage.js';
import VulnerabilitiesPage from './vulns/vulnspage.js';

import './css/gsa-base.css';
import './css/app.css';

const {config = {}} = window;

const caches = new CacheFactory();

const gmp = new Gmp({caches, ...config});

window.gmp = gmp;

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
    return {gmp, caches};
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
  gmp: PropTypes.gmp,
  caches: PropTypes.cachefactory,
};

App.contextTypes = {
  router: PropTypes.object.isRequired,
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
          path="secinfos"
          component={AllSecInfosPage}/>
        <Route
          path="portlists"
          component={PortListsPage}/>
        <Route
          path="credentials"
          component={CredentialsPage}/>
        <Route
          path="filters"
          component={FiltersPage}/>
        <Route
          path="alerts"
          component={AlertsPage}/>
        <Route
          path="schedules"
          component={SchedulesPage}/>
        <Route
          path="reportformats"
          component={ReportFormatsPage}/>
        <Route
          path="agents"
          component={AgentsPage}/>
        <Route
          path="tags"
          component={TagsPage}/>
        <Route
          path="permissions"
          component={PermissionsPage}/>
        <Route
          path="scanners"
          component={ScannersPage}/>
        <Route
          path="scanconfigs"
          component={ScanConfigsPage}/>
        <Route
          path="users"
          component={UsersPage}/>
        <Route
          path="groups"
          component={GroupsPage}/>
        <Route
          path="roles"
          component={RolesPage}/>
        <Route
          path="dashboards/scans"
          component={ScansPage}/>
        <Route
          path="dashboards/assets"
          component={AssetsPage}/>
        <Route
          path="dashboards/secinfo"
          component={SecinfoPage}/>
        <Route
          path="result/:id"
          component={ResultDetailsPage}
        />
      </Route>
      <Redirect from="/" to="/ng"/>
      <Route path="*" component={PageNotFound} />
    </Route>
  </Router>,
  document.getElementById('app')
);

export default App;

// vim: set ts=2 sw=2 tw=80:
