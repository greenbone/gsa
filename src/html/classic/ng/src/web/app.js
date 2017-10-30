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

import React from 'react';
import ReactDOM from 'react-dom';

import {ThemeProvider} from 'glamorous';

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

import CacheFactoryProvider from './components/provider/cachefactoryprovider.js'; // eslint-disable-line max-len

import PropTypes from './utils/proptypes.js';

import {get_severity_levels} from './utils/render.js';
import theme from './utils/theme.js';

import AssetsPage from './pages/assetspage.js';
import HomePage from './pages/homepage.js';
import LoginPage from './pages/loginpage.js';
import Page from './pages/page.js';
import PageNotFound from './pages/notfoundpage.js';
import ScansPage from './pages/scanspage.js';
import SecinfoPage from './pages/secinfopage.js';

import AgentsPage from './pages/agents/listpage.js';
import AlertsPage from './pages/alerts/listpage.js';
import AllSecInfosPage from './pages/allsecinfo/listpage.js';
import CertBundAdvsPage from './pages/certbund/listpage.js';
import CertBundAdvDetailsPage from './pages/certbund/detailspage.js';
import CpesPage from './pages/cpes/listpage.js';
import CpeDetailsPage from './pages/cpes/detailspage.js';
import CredentialsPage from './pages/credentials/listpage.js';
import CvesPage from './pages/cves/listpage.js';
import CveDetailsPage from './pages/cves/detailspage.js';
import CvssCalculatorPage from './pages/extras/cvsscalculatorpage.js';
import DfnCertAdvsPage from './pages/dfncert/listpage.js';
import FeedStatusPage from './pages/extras/feedstatuspage.js';
import FiltersPage from './pages/filters/listpage.js';
import GroupsPage from './pages/groups/listpage.js';
import HostsPage from './pages/hosts/listpage.js';
import HostDetailsPage from './pages/hosts/detailspage.js';
import NotesPage from './pages/notes/listpage.js';
import NoteDetailsPage from './pages/notes/detailspage.js';
import NvtsPage from './pages/nvts/listpage.js';
import NvtDetailsPage from './pages/nvts/detailspage.js';
import OperatingSystemsPage from './pages/os/listpage.js';
import OperatingSystemDetailsPage from './pages/os/detailspage.js';
import OvaldefsPage from './pages/ovaldefs/listpage.js';
import OvaldefDetailsPage from './pages/ovaldefs/detailspage.js';
import OverridesPage from './pages/overrides/listpage.js';
import OverrideDetailsPage from './pages/overrides/detailspage.js';
import PermissionsPage from './pages/permissions/listpage.js';
import PortListsPage from './pages/portlists/listpage.js';
import ReportFormatsPage from './pages/reportformats/listpage.js';
import ReportsPage from './pages/reports/listpage.js';
import ReportDetailsPage from './pages/reports/detailspage.js';
import ResultsPage from './pages/results/listpage.js';
import ResultDetailsPage from './pages/results/detailspage.js';
import RolesPage from './pages/roles/listpage.js';
import ScanConfigsPage from './pages/scanconfigs/listpage.js';
import ScannersPage from './pages/scanners/listpage.js';
import SchedulesPage from './pages/schedules/listpage.js';
import TagsPage from './pages/tags/listpage.js';
import TargetsPage from './pages/targets/listpage.js';
import TargetDetailsPage from './pages/targets/detailspage.js';
import TasksPage from './pages/tasks/listpage.js';
import TaskDetailsPage from './pages/tasks/detailspage.js';
import TrashcanPage from './pages/extras/trashcanpage.js';
import UsersPage from './pages/users/listpage.js';
import VulnerabilitiesPage from './pages/vulns/listpage.js';

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
        next: next_state.location.pathname,
      },
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
    if (xhr.status === 401 && window.location.pathname !== '/login') {
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
    return {gmp};
  }

  toLoginPage() {
    gmp.token = undefined;
    this.context.router.replace({
      pathname: '/login',
      state: {
        next: this.props.location.pathname,
      },
    });
  }

  render() {
    return (
      <CacheFactoryProvider caches={caches}>
        <ThemeProvider theme={theme}>
          {this.props.children}
        </ThemeProvider>
      </CacheFactoryProvider>
    );
  }
}

App.childContextTypes = {
  gmp: PropTypes.gmp,
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
          path="trashcan"
          component={TrashcanPage}/>
        <Route
          path="feedstatus"
          component={FeedStatusPage}/>
        <Route
          path="cvsscalculator"
          component={CvssCalculatorPage}/>
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
        <Route
          path="task/:id"
          component={TaskDetailsPage}
        />
        <Route
          path="target/:id"
          component={TargetDetailsPage}
        />
        <Route
          path="note/:id"
          component={NoteDetailsPage}
        />
        <Route
          path="override/:id"
          component={OverrideDetailsPage}
        />
        <Route
          path="host/:id"
          component={HostDetailsPage}
        />
        <Route
          path="operatingsystem/:id"
          component={OperatingSystemDetailsPage}
        />
        <Route
          path="nvt/:id"
          component={NvtDetailsPage}
        />
        <Route
          path="cve/:id"
          component={CveDetailsPage}
        />
        <Route
          path="report/delta/:id/:deltaid"
          component={ReportDetailsPage}
        />
        <Route
          path="report/:id"
          component={ReportDetailsPage}
        />
        <Route
          path="cpe/:id"
          component={CpeDetailsPage}
        />
        <Route
          path="ovaldef/:id"
          component={OvaldefDetailsPage}
        />
        <Route
          path="certbundadv/:id"
          component={CertBundAdvDetailsPage}
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
