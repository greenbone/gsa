/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router';
import Loading from 'web/components/loading/loading';
import LocationObserver from 'web/components/observer/locationobserver';
import SessionObserver from 'web/components/observer/sessionobserver';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';

import Authorized from './authorized';
import AlertDetailsPage from './pages/alerts/detailspage';
import AlertsPage from './pages/alerts/listpage';
import AuditsDetailsPage from './pages/audits/detailspage';
import AuditsPage from './pages/audits/listpage';
import CertBundDetailsPage from './pages/certbund/detailspage';
import CertBundsPage from './pages/certbund/listpage';
import CpeDetailsPage from './pages/cpes/detailspage';
import CpesPage from './pages/cpes/listpage';
import CredentialDetailsPage from './pages/credentials/detailspage';
import CredentialsPage from './pages/credentials/listpage';
import CveDetailsPage from './pages/cves/detailspage';
import CvesPage from './pages/cves/listpage';
import DfnCertDetailsPage from './pages/dfncert/detailspage';
import DfnCertsPage from './pages/dfncert/listpage';
import CvssCalculatorPage from './pages/extras/cvsscalculatorpage';
import FeedStatusPage from './pages/extras/feedstatuspage';
import TrashcanPage from './pages/extras/trashcanpage';
import FilterDetailsPage from './pages/filters/detailspage';
import FiltersPage from './pages/filters/listpage';
import GroupDetailsPage from './pages/groups/detailspage';
import GroupsPage from './pages/groups/listpage';
import AboutPage from './pages/help/about';
import HostDetailsPage from './pages/hosts/detailspage';
import HostsPage from './pages/hosts/listpage';
import LdapPage from './pages/ldap/ldappage';
import LoginPage from './pages/login/loginpage';
import NoteDetailsPage from './pages/notes/detailspage';
import NotesPage from './pages/notes/listpage';
import PageNotFound from './pages/notfoundpage';
import NvtDetailsPage from './pages/nvts/detailspage';
import NvtsPage from './pages/nvts/listpage';
import LegacyOmpPage from './pages/omp';
import OperatingSystemDetailsPage from './pages/operatingsystems/detailspage';
import OperatingSystemsPage from './pages/operatingsystems/listpage';
import OverrideDetailsPage from './pages/overrides/detailspage';
import OverridesPage from './pages/overrides/listpage';
import Page from './pages/page';
import PerformancePage from './pages/performance/performancepage';
import PermissionDetailsPage from './pages/permissions/detailspage';
import PermissionsPage from './pages/permissions/listpage';
import PoliciesDetailsPage from './pages/policies/detailspage';
import PoliciesPage from './pages/policies/listpage';
import PortListDetailsPage from './pages/portlists/detailspage';
import PortListsPage from './pages/portlists/listpage';
import RadiusPage from './pages/radius/radiuspage';
import ReportConfigDetailsPage from './pages/reportconfigs/detailspage';
import ReportConfigsPage from './pages/reportconfigs/listpage';
import ReportFormatDetailsPage from './pages/reportformats/detailspage';
import ReportFormatsPage from './pages/reportformats/listpage';
import DeltaAuditReportDetailsPage from './pages/reports/auditdeltadetailspage';
import AuditReportDetailsPage from './pages/reports/auditdetailspage';
import AuditReportsPage from './pages/reports/auditreportslistpage';
import DeltaReportDetailsPage from './pages/reports/deltadetailspage';
import ReportDetailsPage from './pages/reports/detailspage';
import ReportsPage from './pages/reports/listpage';
import ResultDetailsPage from './pages/results/detailspage';
import ResultsPage from './pages/results/listpage';
import RoleDetailsPage from './pages/roles/detailspage';
import RolesPage from './pages/roles/listpage';
import ScanConfigDetailsPage from './pages/scanconfigs/detailspage';
import ScanConfigsPage from './pages/scanconfigs/listpage';
import ScannerDetailsPage from './pages/scanners/detailspage';
import ScannersPage from './pages/scanners/listpage';
import ScheduleDetailsPage from './pages/schedules/detailspage';
import SchedulesPage from './pages/schedules/listpage';
import StartPage from './pages/start/page';
import TagDetailsPage from './pages/tags/detailspage';
import TagsPage from './pages/tags/listpage';
import TargetDetailsPage from './pages/targets/detailspage';
import TargetsPage from './pages/targets/listpage';
import TaskDetailsPage from './pages/tasks/detailspage';
import TasksPage from './pages/tasks/listpage';
import TicketDetailsPage from './pages/tickets/detailspage';
import TicketsPage from './pages/tickets/listpage';
import TlsCertificateDetailsPage from './pages/tlscertificates/detailspage';
import TlsCertificatesPage from './pages/tlscertificates/listpage';
import UserDetailsPage from './pages/users/detailspage';
import UsersPage from './pages/users/listpage';
import UserSettingsPage from './pages/usersettings/usersettingspage';
import VulnerabilitiesPage from './pages/vulns/listpage';

const LoggedOutRoutes = () => (
  <Routes>
    <Route element={<LoginPage />} path="/login" />
    <Route element={<LegacyOmpPage />} path="/omp" />
    <Route element={<Navigate to="/login" />} path="*" />
  </Routes>
);

const LoggedInRoutes = () => {
  return (
    <Authorized>
      <SessionObserver />
      <LocationObserver>
        <Page>
          <Routes>
            <Route element={<StartPage />} path="/dashboards" />
            <Route element={<AboutPage />} path="/about" />
            <Route element={<AlertsPage />} path="/alerts" />
            <Route element={<AuditsPage />} path="/audits" />
            <Route element={<CertBundsPage />} path="/certbunds" />
            <Route element={<CpesPage />} path="/cpes" />
            <Route element={<CredentialsPage />} path="/credentials" />
            <Route element={<CvesPage />} path="/cves" />
            <Route element={<DfnCertsPage />} path="/dfncerts" />
            <Route element={<FeedStatusPage />} path="/feedstatus" />
            <Route element={<FiltersPage />} path="/filters" />
            <Route element={<GroupsPage />} path="/groups" />
            <Route element={<HostsPage />} path="/hosts" />
            <Route element={<LdapPage />} path="/ldap" />
            <Route element={<NotesPage />} path="/notes" />
            <Route
              element={<OperatingSystemsPage />}
              path="/operatingsystems"
            />
            <Route element={<NvtsPage />} path="/nvts" />
            <Route element={<OverridesPage />} path="/overrides" />
            <Route element={<PerformancePage />} path="/performance" />
            <Route element={<PermissionsPage />} path="/permissions" />
            <Route element={<PoliciesPage />} path="/policies" />
            <Route element={<PortListsPage />} path="/portlists" />
            <Route element={<RadiusPage />} path="/radius" />
            <Route element={<ReportsPage />} path="/reports" />
            <Route element={<ReportConfigsPage />} path="/reportconfigs" />
            <Route element={<ReportFormatsPage />} path="/reportformats" />
            <Route element={<ResultsPage />} path="/results" />
            <Route element={<RolesPage />} path="/roles" />
            <Route element={<TagsPage />} path="/tags" />
            <Route element={<PermissionsPage />} path="/permissions" />
            <Route element={<ScannersPage />} path="/scanners" />
            <Route element={<ScanConfigsPage />} path="/scanconfigs" />
            <Route element={<ScannersPage />} path="/scanners" />
            <Route element={<SchedulesPage />} path="/schedules" />
            <Route element={<TagsPage />} path="/tags" />
            <Route element={<TargetsPage />} path="/targets" />
            <Route element={<TasksPage />} path="/tasks" />
            <Route element={<TicketsPage />} path="/tickets" />
            <Route element={<TrashcanPage />} path="/trashcan" />
            <Route element={<TlsCertificatesPage />} path="/tlscertificates" />
            <Route element={<UsersPage />} path="/users" />
            <Route element={<UserSettingsPage />} path="/usersettings" />
            <Route element={<VulnerabilitiesPage />} path="/vulnerabilities" />
            <Route element={<CvssCalculatorPage />} path="/cvsscalculator" />
            <Route element={<AlertDetailsPage />} path="/alert/:id" />
            <Route element={<AuditsDetailsPage />} path="/audit/:id" />
            <Route element={<CertBundDetailsPage />} path="/certbund/:id" />
            <Route element={<CpeDetailsPage />} path="/cpe/:id" />
            <Route element={<CredentialDetailsPage />} path="/credential/:id" />
            <Route element={<CveDetailsPage />} path="/cve/:id" />
            <Route element={<DfnCertDetailsPage />} path="/dfncert/:id" />
            <Route element={<FilterDetailsPage />} path="/filter/:id" />
            <Route element={<GroupDetailsPage />} path="/group/:id" />
            <Route element={<HostDetailsPage />} path="/host/:id" />
            <Route element={<NoteDetailsPage />} path="/note/:id" />
            <Route element={<NvtDetailsPage />} path="/nvt/:id" />
            <Route element={<PortListDetailsPage />} path="/portlist/:id" />
            <Route
              element={<OperatingSystemDetailsPage />}
              path="/operatingsystem/:id"
            />
            <Route element={<OverrideDetailsPage />} path="/override/:id" />
            <Route element={<PermissionDetailsPage />} path="/permission/:id" />
            <Route element={<PoliciesDetailsPage />} path="/policy/:id" />
            <Route
              element={<DeltaReportDetailsPage />}
              path="/report/delta/:id/:deltaid"
            />
            <Route element={<ReportDetailsPage />} path="/report/:id" />
            <Route
              element={<ReportConfigDetailsPage />}
              path="/reportconfig/:id"
            />
            <Route
              element={<ReportFormatDetailsPage />}
              path="/reportformat/:id"
            />
            <Route element={<ResultDetailsPage />} path="/result/:id" />
            <Route element={<RoleDetailsPage />} path="/role/:id" />
            <Route element={<FilterDetailsPage />} path="/filter/:id" />
            <Route element={<TagDetailsPage />} path="/tag/:id" />
            <Route element={<PermissionDetailsPage />} path="/permission/:id" />
            <Route element={<ScanConfigDetailsPage />} path="/scanconfig/:id" />
            <Route element={<ScannerDetailsPage />} path="/scanner/:id" />
            <Route element={<ScheduleDetailsPage />} path="/schedule/:id" />
            <Route element={<TagDetailsPage />} path="/tag/:id" />
            <Route element={<TargetDetailsPage />} path="/target/:id" />
            <Route element={<TaskDetailsPage />} path="/task/:id" />
            <Route element={<TicketDetailsPage />} path="/ticket/:id" />
            <Route
              element={<TlsCertificateDetailsPage />}
              path="/tlscertificate/:id"
            />
            <Route element={<UserDetailsPage />} path="/user/:id" />

            <Route element={<PageNotFound />} path="/notfound" />
            <Route element={<AuditReportsPage />} path="/auditreports" />
            <Route
              element={<DeltaAuditReportDetailsPage />}
              path="/auditreport/delta/:id/:deltaid"
            />
            <Route
              element={<AuditReportDetailsPage />}
              path="/auditreport/:id"
            />
            <Route element={<Navigate to="/dashboards" />} path="/" />

            <Route element={<PageNotFound />} path="*" />
          </Routes>
        </Page>
      </LocationObserver>
    </Authorized>
  );
};

const AppRoutes = () => {
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = useSelector(selectIsLoggedIn);

  useEffect(() => {
    if (isLoggedIn !== undefined) {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <Router
      future={{
        // eslint-disable-next-line camelcase
        v7_startTransition: true,
        // eslint-disable-next-line camelcase
        v7_relativeSplatPath: false,
      }}
    >
      {isLoggedIn ? <LoggedInRoutes /> : <LoggedOutRoutes />}
    </Router>
  );
};

export default AppRoutes;
