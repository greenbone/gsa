/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router';
import Loading from 'web/components/loading/Loading';
import LocationObserver from 'web/components/observer/LocationObserver';
import SessionObserver from 'web/components/observer/SessionObserver';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';

import Authorized from './Authorized';
import AlertDetailsPage from './pages/alerts/DetailsPage';
import AlertsPage from './pages/alerts/ListPage';
import AuditsDetailsPage from './pages/audits/DetailsPage';
import AuditsPage from './pages/audits/ListPage';
import CertBundDetailsPage from './pages/certbund/DetailsPage';
import CertBundsPage from './pages/certbund/ListPage';
import CpeDetailsPage from './pages/cpes/DetailsPage';
import CpesPage from './pages/cpes/ListPage';
import CredentialDetailsPage from './pages/credentials/DetailsPage';
import CredentialsPage from './pages/credentials/ListPage';
import CveDetailsPage from './pages/cves/DetailsPage';
import CvesPage from './pages/cves/ListPage';
import DfnCertDetailsPage from './pages/dfncert/DetailsPage';
import DfnCertsPage from './pages/dfncert/ListPage';
import CvssCalculatorPage from './pages/extras/CvssCalculatorPage';
import FeedStatusPage from './pages/extras/FeedStatusPage';
import TrashcanPage from './pages/extras/TrashCanPage';
import FilterDetailsPage from './pages/filters/DetailsPage';
import FiltersPage from './pages/filters/ListPage';
import GroupDetailsPage from './pages/groups/DetailsPage';
import GroupsPage from './pages/groups/ListPage';
import AboutPage from './pages/help/About';
import HostDetailsPage from './pages/hosts/DetailsPage';
import HostsPage from './pages/hosts/ListPage';
import LdapPage from './pages/ldap/LdapPage';
import LoginPage from './pages/login/LoginPage';
import NoteDetailsPage from './pages/notes/DetailsPage';
import NotesPage from './pages/notes/ListPage';
import PageNotFound from './pages/NotFoundPage';
import NvtDetailsPage from './pages/nvts/DetailsPage';
import NvtsPage from './pages/nvts/ListPage';
import LegacyOmpPage from './pages/Omp';
import OperatingSystemDetailsPage from './pages/operatingsystems/DetailsPage';
import OperatingSystemsPage from './pages/operatingsystems/ListPage';
import OverrideDetailsPage from './pages/overrides/DetailsPage';
import OverridesPage from './pages/overrides/ListPage';
import Page from './pages/Page';
import PerformancePage from './pages/performance/PerformancePage';
import PermissionDetailsPage from './pages/permissions/DetailsPage';
import PermissionsPage from './pages/permissions/ListPage';
import PoliciesDetailsPage from './pages/policies/DetailsPage';
import PoliciesPage from './pages/policies/ListPage';
import PortListDetailsPage from './pages/portlists/DetailsPage';
import PortListsPage from './pages/portlists/ListPage';
import RadiusPage from './pages/radius/RadiusPage';
import ReportConfigDetailsPage from './pages/reportconfigs/DetailsPage';
import ReportConfigsPage from './pages/reportconfigs/ListPage';
import ReportFormatDetailsPage from './pages/reportformats/DetailsPage';
import ReportFormatsPage from './pages/reportformats/ListPage';
import DeltaAuditReportDetailsPage from './pages/reports/AuditDeltaDetailsPage';
import AuditReportDetailsPage from './pages/reports/AuditDetailsPage';
import AuditReportsPage from './pages/reports/AuditReportsListPage';
import DeltaReportDetailsPage from './pages/reports/DeltaDetailsPage';
import ReportDetailsPage from './pages/reports/DetailsPage';
import ReportsPage from './pages/reports/ListPage';
import ResultDetailsPage from './pages/results/DetailsPage';
import ResultsPage from './pages/results/ListPage';
import RoleDetailsPage from './pages/roles/DetailsPage';
import RolesPage from './pages/roles/ListPage';
import ScanConfigDetailsPage from './pages/scanconfigs/DetailsPage';
import ScanConfigsPage from './pages/scanconfigs/ListPage';
import ScannerDetailsPage from './pages/scanners/DetailsPage';
import ScannersPage from './pages/scanners/ListPage';
import ScheduleDetailsPage from './pages/schedules/DetailsPage';
import SchedulesPage from './pages/schedules/ListPage';
import StartPage from './pages/start/Page';
import TagDetailsPage from './pages/tags/DetailsPage';
import TagsPage from './pages/tags/ListPage';
import TargetDetailsPage from './pages/targets/DetailsPage';
import TargetsPage from './pages/targets/ListPage';
import TaskDetailsPage from './pages/tasks/DetailsPage';
import TasksPage from './pages/tasks/ListPage';
import TicketDetailsPage from './pages/tickets/DetailsPage';
import TicketsPage from './pages/tickets/ListPage';
import TlsCertificateDetailsPage from './pages/tlscertificates/DetailsPage';
import TlsCertificatesPage from './pages/tlscertificates/ListPage';
import UserDetailsPage from './pages/users/DetailsPage';
import UsersPage from './pages/users/ListPage';
import UserSettingsPage from './pages/usersettings/UserSettingsPage';
import VulnerabilitiesPage from './pages/vulns/ListPage';

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
