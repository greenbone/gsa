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

import {Router, Route, Switch} from 'react-router-dom';

import {createBrowserHistory} from 'history';
import {stringify, parse} from 'qs';
import qhistory from 'qhistory';

import LocationObserver from 'web/components/observer/locationobserver';
import SessionObserver from 'web/components/observer/sessionobserver';

import LegacyOmpPage from './pages/omp';
import Page from './pages/page';
import PageNotFound from './pages/notfoundpage';
import StartPage from './pages/start/page';

import AboutPage from './pages/help/about';
import AgentsPage from './pages/agents/listpage';
import AgentDetailsPage from './pages/agents/detailspage';
import AlertsPage from './pages/alerts/listpage';
import AlertDetailsPage from './pages/alerts/detailspage';
import SecInfosPage from './pages/secinfo/listpage';
import CertBundsPage from './pages/certbund/listpage';
import CertBundDetailsPage from './pages/certbund/detailspage';
import CpesPage from './pages/cpes/listpage';
import CpeDetailsPage from './pages/cpes/detailspage';
import CredentialsPage from './pages/credentials/listpage';
import CredentialDetailsPage from './pages/credentials/detailspage';
import CvesPage from './pages/cves/listpage';
import CveDetailsPage from './pages/cves/detailspage';
import CvssCalculatorPage from './pages/extras/cvsscalculatorpage';
import DfnCertsPage from './pages/dfncert/listpage';
import DfnCertDetailsPage from './pages/dfncert/detailspage';
import FeedStatusPage from './pages/extras/feedstatuspage';
import FiltersPage from './pages/filters/listpage';
import FilterDetailsPage from './pages/filters/detailspage';
import GroupsPage from './pages/groups/listpage';
import GroupDetailsPage from './pages/groups/detailspage';
import HostsPage from './pages/hosts/listpage';
import HostDetailsPage from './pages/hosts/detailspage';
import LdapPage from './pages/ldap/ldappage';
import LoginPage from './pages/login/loginpage';
import NotesPage from './pages/notes/listpage';
import NoteDetailsPage from './pages/notes/detailspage';
import NvtsPage from './pages/nvts/listpage';
import NvtDetailsPage from './pages/nvts/detailspage';
import OperatingSystemsPage from './pages/operatingsystems/listpage';
import OperatingSystemDetailsPage from './pages/operatingsystems/detailspage';
import OvaldefsPage from './pages/ovaldefs/listpage';
import OvaldefDetailsPage from './pages/ovaldefs/detailspage';
import OverridesPage from './pages/overrides/listpage';
import OverrideDetailsPage from './pages/overrides/detailspage';
import PerformancePage from './pages/performance/performancepage';
import PermissionsPage from './pages/permissions/listpage';
import PermissionDetailsPage from './pages/permissions/detailspage';
import PortListsPage from './pages/portlists/listpage';
import PortListDetailsPage from './pages/portlists/detailspage';
import RadiusPage from './pages/radius/radiuspage';
import ReportFormatsPage from './pages/reportformats/listpage';
import ReportFormatDetailsPage from './pages/reportformats/detailspage';
import ReportsPage from './pages/reports/listpage';
import ReportDetailsPage from './pages/reports/detailspage';
import ResultsPage from './pages/results/listpage';
import ResultDetailsPage from './pages/results/detailspage';
import RolesPage from './pages/roles/listpage';
import RoleDetailsPage from './pages/roles/detailspage';
import ScanConfigsPage from './pages/scanconfigs/listpage';
import ScanConfigDetailsPage from './pages/scanconfigs/detailspage';
import ScannersPage from './pages/scanners/listpage';
import ScannerDetailsPage from './pages/scanners/detailspage';
import SchedulesPage from './pages/schedules/listpage';
import ScheduleDetailsPage from './pages/schedules/detailspage';
import TagsPage from './pages/tags/listpage';
import TagDetailsPage from './pages/tags/detailspage';
import TargetsPage from './pages/targets/listpage';
import TargetDetailsPage from './pages/targets/detailspage';
import TasksPage from './pages/tasks/listpage';
import TaskDetailsPage from './pages/tasks/detailspage';
import TicketsPage from './pages/tickets/listpage';
import TicketDetailsPage from './pages/tickets/detailspage';
import TrashcanPage from './pages/extras/trashcanpage';
import UserDetailsPage from './pages/users/detailspage';
import UserSettingsPage from './pages/usersettings/usersettingspage';
import UsersPage from './pages/users/listpage';
import VulnerabilitiesPage from './pages/vulns/listpage';

import PropTypes from 'web/utils/proptypes';
import withGmp from 'web/utils/withGmp';

import Authorized from './authorized';

// create an own history for location.query support
// see https://github.com/ReactTraining/react-router/blob/master/packages/react-router/docs/guides/migrating.md#query-strings
// for details
export const createQueryHistory = (history = createBrowserHistory()) =>
  qhistory(history, stringify, parse);

const HISTORY = createQueryHistory();

const Routes = () => (
  <Router history={HISTORY}>
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/omp" component={LegacyOmpPage} />
      <Authorized>
        <SessionObserver />
        <LocationObserver>
          <Page>
            <Switch>
              <Route exact path="/" component={StartPage} />
              <Route path="/about" component={AboutPage} />
              <Route path="/radius" component={RadiusPage} />
              <Route path="/ldap" component={LdapPage} />
              <Route path="/usersettings" component={UserSettingsPage} />
              <Route path="/trashcan" component={TrashcanPage} />
              <Route path="/feedstatus" component={FeedStatusPage} />
              <Route path="/cvsscalculator" component={CvssCalculatorPage} />
              <Route path="/performance" component={PerformancePage} />
              <Route path="/tasks" component={TasksPage} />
              <Route path="/tickets" component={TicketsPage} />
              <Route path="/results" component={ResultsPage} />
              <Route path="/notes" component={NotesPage} />
              <Route path="/overrides" component={OverridesPage} />
              <Route
                path="/operatingsystems"
                component={OperatingSystemsPage}
              />
              <Route path="/reports" component={ReportsPage} />
              <Route path="/hosts" component={HostsPage} />
              <Route path="/targets" component={TargetsPage} />
              <Route path="/vulnerabilities" component={VulnerabilitiesPage} />
              <Route path="/nvts" component={NvtsPage} />
              <Route path="/cves" component={CvesPage} />
              <Route path="/cpes" component={CpesPage} />
              <Route path="/ovaldefs" component={OvaldefsPage} />
              <Route path="/certbunds" component={CertBundsPage} />
              <Route path="/dfncerts" component={DfnCertsPage} />
              <Route path="/secinfos" component={SecInfosPage} />
              <Route path="/portlists" component={PortListsPage} />
              <Route path="/credentials" component={CredentialsPage} />
              <Route path="/filters" component={FiltersPage} />
              <Route path="/alerts" component={AlertsPage} />
              <Route path="/schedules" component={SchedulesPage} />
              <Route path="/reportformats" component={ReportFormatsPage} />
              <Route path="/agents" component={AgentsPage} />
              <Route path="/tags" component={TagsPage} />
              <Route path="/permissions" component={PermissionsPage} />
              <Route path="/scanners" component={ScannersPage} />
              <Route path="/scanconfigs" component={ScanConfigsPage} />
              <Route path="/users" component={UsersPage} />
              <Route path="/groups" component={GroupsPage} />
              <Route path="/roles" component={RolesPage} />
              <Route path="/result/:id" component={ResultDetailsPage} />
              <Route path="/task/:id" component={TaskDetailsPage} />
              <Route path="/target/:id" component={TargetDetailsPage} />
              <Route path="/ticket/:id" component={TicketDetailsPage} />
              <Route path="/alert/:id" component={AlertDetailsPage} />
              <Route path="/note/:id" component={NoteDetailsPage} />
              <Route path="/override/:id" component={OverrideDetailsPage} />
              <Route path="/host/:id" component={HostDetailsPage} />
              <Route
                path="/operatingsystem/:id"
                component={OperatingSystemDetailsPage}
              />
              <Route path="/nvt/:id" component={NvtDetailsPage} />
              <Route path="/cve/:id" component={CveDetailsPage} />
              <Route
                path="/report/delta/:id/:deltaid"
                component={ReportDetailsPage}
              />
              <Route path="/report/:id" component={ReportDetailsPage} />
              <Route path="/cpe/:id" component={CpeDetailsPage} />
              <Route path="/ovaldef/:id" component={OvaldefDetailsPage} />
              <Route path="/certbund/:id" component={CertBundDetailsPage} />
              <Route path="/dfncert/:id" component={DfnCertDetailsPage} />
              <Route path="/user/:id" component={UserDetailsPage} />
              <Route path="/group/:id" component={GroupDetailsPage} />
              <Route path="/role/:id" component={RoleDetailsPage} />
              <Route path="/portlist/:id" component={PortListDetailsPage} />
              <Route path="/credential/:id" component={CredentialDetailsPage} />
              <Route path="/schedule/:id" component={ScheduleDetailsPage} />
              <Route path="/scanner/:id" component={ScannerDetailsPage} />
              <Route
                path="/reportformat/:id"
                component={ReportFormatDetailsPage}
              />
              <Route path="/agent/:id" component={AgentDetailsPage} />
              <Route path="/filter/:id" component={FilterDetailsPage} />
              <Route path="/tag/:id" component={TagDetailsPage} />
              <Route path="/permission/:id" component={PermissionDetailsPage} />
              <Route path="/scanconfig/:id" component={ScanConfigDetailsPage} />
              <Route path="/notfound" component={PageNotFound} />
              <Route component={PageNotFound} />
            </Switch>
          </Page>
        </LocationObserver>
      </Authorized>
    </Switch>
  </Router>
);

Routes.propTypes = {
  gmp: PropTypes.gmp.isRequired,
};

export default withGmp(Routes);

// vim: set ts=2 sw=2 tw=80:
