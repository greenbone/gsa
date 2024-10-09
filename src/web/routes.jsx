/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';
import LocationObserver from 'web/components/observer/locationobserver';
import SessionObserver from 'web/components/observer/sessionobserver';

import ConditionalRoute from 'web/components/conditionalRoute/ConditionalRoute';
import Loading from 'web/components/loading/loading';

import LegacyOmpPage from './pages/omp';
import Page from './pages/page';
import PageNotFound from './pages/notfoundpage';
import StartPage from './pages/start/page';

import AboutPage from './pages/help/about';
import AlertsPage from './pages/alerts/listpage';
import AuditReportDetailsPage from './pages/reports/auditdetailspage';
import AlertDetailsPage from './pages/alerts/detailspage';
import AuditsPage from './pages/audits/listpage';
import AuditReportsPage from './pages/reports/auditreportslistpage';
import AuditsDetailsPage from './pages/audits/detailspage';
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
import OverridesPage from './pages/overrides/listpage';
import OverrideDetailsPage from './pages/overrides/detailspage';
import PerformancePage from './pages/performance/performancepage';
import PermissionsPage from './pages/permissions/listpage';
import PermissionDetailsPage from './pages/permissions/detailspage';
import PoliciesPage from './pages/policies/listpage';
import PoliciesDetailsPage from './pages/policies/detailspage';
import PortListsPage from './pages/portlists/listpage';
import PortListDetailsPage from './pages/portlists/detailspage';
import RadiusPage from './pages/radius/radiuspage';
import ReportConfigsPage from './pages/reportconfigs/listpage';
import ReportConfigDetailsPage from './pages/reportconfigs/detailspage';
import ReportFormatsPage from './pages/reportformats/listpage';
import ReportFormatDetailsPage from './pages/reportformats/detailspage';
import ReportsPage from './pages/reports/listpage';
import ReportDetailsPage from './pages/reports/detailspage';
import DeltaAuditReportDetailsPage from './pages/reports/auditdeltadetailspage';
import DeltaReportDetailsPage from './pages/reports/deltadetailspage';
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
import TlsCertificatesPage from './pages/tlscertificates/listpage';
import TlsCertificateDetailsPage from './pages/tlscertificates/detailspage';
import TrashcanPage from './pages/extras/trashcanpage';
import UserDetailsPage from './pages/users/detailspage';
import UserSettingsPage from './pages/usersettings/usersettingspage';
import UsersPage from './pages/users/listpage';
import VulnerabilitiesPage from './pages/vulns/listpage';

import {useSelector} from 'react-redux';
import Authorized from './authorized';

const LoggedOutRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/omp" element={<LegacyOmpPage />} />
    <Route path="*" element={<Navigate to="/login" />} />
  </Routes>
);

const LoggedInRoutes = () => {
  return (
    <Authorized>
      <SessionObserver />
      <LocationObserver>
        <Page>
          <Routes>
            <Route path="/dashboards" element={<StartPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/audits" element={<AuditsPage />} />
            <Route path="/certbunds" element={<CertBundsPage />} />
            <Route path="/cpes" element={<CpesPage />} />
            <Route path="/credentials" element={<CredentialsPage />} />
            <Route path="/cves" element={<CvesPage />} />
            <Route path="/dfncerts" element={<DfnCertsPage />} />
            <Route path="/feedstatus" element={<FeedStatusPage />} />
            <Route path="/filters" element={<FiltersPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/hosts" element={<HostsPage />} />
            <Route path="/ldap" element={<LdapPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route
              path="/operatingsystems"
              element={<OperatingSystemsPage />}
            />
            <Route path="/nvts" element={<NvtsPage />} />
            <Route path="/overrides" element={<OverridesPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/policies" element={<PoliciesPage />} />
            <Route path="/portlists" element={<PortListsPage />} />
            <Route path="/radius" element={<RadiusPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reportconfigs" element={<ReportConfigsPage />} />
            <Route path="/reportformats" element={<ReportFormatsPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/permissions" element={<PermissionsPage />} />
            <Route path="/scanners" element={<ScannersPage />} />
            <Route path="/scanconfigs" element={<ScanConfigsPage />} />
            <Route path="/scanners" element={<ScannersPage />} />
            <Route path="/schedules" element={<SchedulesPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/targets" element={<TargetsPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/trashcan" element={<TrashcanPage />} />
            <Route path="/tlscertificates" element={<TlsCertificatesPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/usersettings" element={<UserSettingsPage />} />
            <Route path="/vulnerabilities" element={<VulnerabilitiesPage />} />
            <Route path="/cvsscalculator" element={<CvssCalculatorPage />} />
            <Route path="/alert/:id" element={<AlertDetailsPage />} />
            <Route path="/audit/:id" element={<AuditsDetailsPage />} />
            <Route path="/certbund/:id" element={<CertBundDetailsPage />} />
            <Route path="/cpe/:id" element={<CpeDetailsPage />} />
            <Route path="/credential/:id" element={<CredentialDetailsPage />} />
            <Route path="/cve/:id" element={<CveDetailsPage />} />
            <Route path="/dfncert/:id" element={<DfnCertDetailsPage />} />
            <Route path="/filter/:id" element={<FilterDetailsPage />} />
            <Route path="/group/:id" element={<GroupDetailsPage />} />
            <Route path="/host/:id" element={<HostDetailsPage />} />
            <Route path="/note/:id" element={<NoteDetailsPage />} />
            <Route path="/nvt/:id" element={<NvtDetailsPage />} />
            <Route path="/portlist/:id" element={<PortListDetailsPage />} />
            <Route
              path="/operatingsystem/:id"
              element={<OperatingSystemDetailsPage />}
            />
            <Route path="/override/:id" element={<OverrideDetailsPage />} />
            <Route path="/permission/:id" element={<PermissionDetailsPage />} />
            <Route path="/policy/:id" element={<PoliciesDetailsPage />} />
            <Route
              path="/report/delta/:id/:deltaid"
              element={<DeltaReportDetailsPage />}
            />
            <Route path="/report/:id" element={<ReportDetailsPage />} />
            <Route
              path="/reportconfig/:id"
              element={<ReportConfigDetailsPage />}
            />
            <Route
              path="/reportformat/:id"
              element={<ReportFormatDetailsPage />}
            />
            <Route path="/result/:id" element={<ResultDetailsPage />} />
            <Route path="/role/:id" element={<RoleDetailsPage />} />
            <Route path="/filter/:id" element={<FilterDetailsPage />} />
            <Route path="/tag/:id" element={<TagDetailsPage />} />
            <Route path="/permission/:id" element={<PermissionDetailsPage />} />
            <Route path="/scanconfig/:id" element={<ScanConfigDetailsPage />} />
            <Route path="/scanner/:id" element={<ScannerDetailsPage />} />
            <Route path="/schedule/:id" element={<ScheduleDetailsPage />} />
            <Route path="/tag/:id" element={<TagDetailsPage />} />
            <Route path="/target/:id" element={<TargetDetailsPage />} />
            <Route path="/task/:id" element={<TaskDetailsPage />} />
            <Route path="/ticket/:id" element={<TicketDetailsPage />} />
            <Route
              path="/tlscertificate/:id"
              element={<TlsCertificateDetailsPage />}
            />
            <Route path="/user/:id" element={<UserDetailsPage />} />

            <Route path="/notfound" element={<PageNotFound />} />
            <Route
              path="/auditreports"
              element={
                <ConditionalRoute
                  component={AuditReportsPage}
                  feature="COMPLIANCE_REPORTS"
                />
              }
            />

            <Route
              path="/auditreport/delta/:id/:deltaid"
              element={
                <ConditionalRoute
                  component={DeltaAuditReportDetailsPage}
                  feature="COMPLIANCE_REPORTS"
                />
              }
            />
            <Route
              path="/auditreport/:id"
              element={
                <ConditionalRoute
                  component={AuditReportDetailsPage}
                  feature="COMPLIANCE_REPORTS"
                />
              }
            />
            <Route path="/" element={<Navigate to="/dashboards" />} />

            <Route path="*" element={<PageNotFound />} />
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
