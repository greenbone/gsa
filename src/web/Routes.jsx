/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router';
import Authorized from 'web/Authorized';
import Loading from 'web/components/loading/Loading';
import LocationObserver from 'web/components/observer/LocationObserver';
import SessionObserver from 'web/components/observer/SessionObserver';
import AlertDetailsPage from 'web/pages/alerts/DetailsPage';
import AlertsPage from 'web/pages/alerts/ListPage';
import AuditsDetailsPage from 'web/pages/audits/DetailsPage';
import AuditsPage from 'web/pages/audits/ListPage';
import CertBundDetailsPage from 'web/pages/certbund/DetailsPage';
import CertBundsPage from 'web/pages/certbund/ListPage';
import CpeDetailsPage from 'web/pages/cpes/DetailsPage';
import CpesPage from 'web/pages/cpes/ListPage';
import CredentialDetailsPage from 'web/pages/credentials/DetailsPage';
import CredentialsPage from 'web/pages/credentials/ListPage';
import CveDetailsPage from 'web/pages/cves/DetailsPage';
import CvesPage from 'web/pages/cves/ListPage';
import DfnCertDetailsPage from 'web/pages/dfncert/DetailsPage';
import DfnCertsPage from 'web/pages/dfncert/ListPage';
import CvssCalculatorPage from 'web/pages/extras/CvssCalculatorPage';
import FeedStatusPage from 'web/pages/extras/FeedStatusPage';
import TrashcanPage from 'web/pages/extras/TrashCanPage';
import FilterDetailsPage from 'web/pages/filters/DetailsPage';
import FiltersPage from 'web/pages/filters/ListPage';
import GroupDetailsPage from 'web/pages/groups/DetailsPage';
import GroupsPage from 'web/pages/groups/ListPage';
import AboutPage from 'web/pages/help/About';
import HostDetailsPage from 'web/pages/hosts/DetailsPage';
import HostsPage from 'web/pages/hosts/ListPage';
import LdapPage from 'web/pages/ldap/LdapPage';
import LoginPage from 'web/pages/login/LoginPage';
import NoteDetailsPage from 'web/pages/notes/DetailsPage';
import NotesPage from 'web/pages/notes/ListPage';
import PageNotFound from 'web/pages/NotFoundPage';
import NvtDetailsPage from 'web/pages/nvts/DetailsPage';
import NvtsPage from 'web/pages/nvts/ListPage';
import LegacyOmpPage from 'web/pages/Omp';
import OperatingSystemDetailsPage from 'web/pages/operatingsystems/DetailsPage';
import OperatingSystemsPage from 'web/pages/operatingsystems/ListPage';
import OverrideDetailsPage from 'web/pages/overrides/DetailsPage';
import OverridesPage from 'web/pages/overrides/ListPage';
import Page from 'web/pages/Page';
import PerformancePage from 'web/pages/performance/PerformancePage';
import PermissionDetailsPage from 'web/pages/permissions/DetailsPage';
import PermissionsPage from 'web/pages/permissions/ListPage';
import PoliciesDetailsPage from 'web/pages/policies/DetailsPage';
import PoliciesPage from 'web/pages/policies/ListPage';
import PortListDetailsPage from 'web/pages/portlists/DetailsPage';
import PortListsPage from 'web/pages/portlists/ListPage';
import RadiusPage from 'web/pages/radius/RadiusPage';
import ReportConfigDetailsPage from 'web/pages/reportconfigs/DetailsPage';
import ReportConfigsPage from 'web/pages/reportconfigs/ListPage';
import ReportFormatDetailsPage from 'web/pages/reportformats/DetailsPage';
import ReportFormatsPage from 'web/pages/reportformats/ListPage';
import DeltaAuditReportDetailsPage from 'web/pages/reports/AuditDeltaDetailsPage';
import AuditReportDetailsPage from 'web/pages/reports/AuditDetailsPage';
import AuditReportsPage from 'web/pages/reports/AuditReportsListPage';
import DeltaReportDetailsPage from 'web/pages/reports/DeltaDetailsPage';
import ReportDetailsPage from 'web/pages/reports/DetailsPage';
import ReportsPage from 'web/pages/reports/ListPage';
import ResultDetailsPage from 'web/pages/results/DetailsPage';
import ResultsPage from 'web/pages/results/ListPage';
import RoleDetailsPage from 'web/pages/roles/DetailsPage';
import RolesPage from 'web/pages/roles/ListPage';
import ScanConfigDetailsPage from 'web/pages/scanconfigs/DetailsPage';
import ScanConfigsPage from 'web/pages/scanconfigs/ListPage';
import ScannerDetailsPage from 'web/pages/scanners/DetailsPage';
import ScannersPage from 'web/pages/scanners/ListPage';
import ScheduleDetailsPage from 'web/pages/schedules/DetailsPage';
import SchedulesPage from 'web/pages/schedules/ListPage';
import StartPage from 'web/pages/start/Page';
import TagDetailsPage from 'web/pages/tags/DetailsPage';
import TagsPage from 'web/pages/tags/ListPage';
import TargetDetailsPage from 'web/pages/targets/DetailsPage';
import TargetsPage from 'web/pages/targets/ListPage';
import TaskDetailsPage from 'web/pages/tasks/DetailsPage';
import TasksPage from 'web/pages/tasks/ListPage';
import TicketDetailsPage from 'web/pages/tickets/DetailsPage';
import TicketsPage from 'web/pages/tickets/ListPage';
import TlsCertificateDetailsPage from 'web/pages/tlscertificates/DetailsPage';
import TlsCertificatesPage from 'web/pages/tlscertificates/ListPage';
import UserSettingsPage from 'web/pages/user-settings/UserSettingsPage';
import UserDetailsPage from 'web/pages/users/DetailsPage';
import UsersPage from 'web/pages/users/ListPage';
import VulnerabilitiesPage from 'web/pages/vulns/ListPage';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';

const LoggedOutRoutes = () => {
  const location = useLocation();
  return (
    <Routes>
      <Route element={<LoginPage />} path="/login" />
      <Route element={<LegacyOmpPage />} path="/omp" />
      <Route
        element={<Navigate state={{from: location}} to="/login" />}
        path="*"
      />
    </Routes>
  );
};

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
    <Router>{isLoggedIn ? <LoggedInRoutes /> : <LoggedOutRoutes />}</Router>
  );
};

export default AppRoutes;
