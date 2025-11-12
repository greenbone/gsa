/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect, Suspense, lazy} from 'react';
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
import SessionObserver from 'web/components/observer/SessionObserver';
import SessionTracker from 'web/components/observer/SessionTracker';
import Page from 'web/pages/Page';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';

// Lazy loaded components
const AgentGroupsListPage = lazy(
  () => import('web/pages/agent-groups/AgentGroupsListPage'),
);
const AgentInstallerListPage = lazy(
  () => import('web/pages/agent-installers/AgentInstallerListPage'),
);
const AgentListPage = lazy(() => import('web/pages/agents/AgentListPage'));
const AlertDetailsPage = lazy(() => import('web/pages/alerts/DetailsPage'));
const AlertsPage = lazy(() => import('web/pages/alerts/ListPage'));
const AuditsDetailsPage = lazy(() => import('web/pages/audits/DetailsPage'));
const AuditsPage = lazy(() => import('web/pages/audits/ListPage'));
const CertBundDetailsPage = lazy(
  () => import('web/pages/certbund/DetailsPage'),
);
const CertBundsPage = lazy(() => import('web/pages/certbund/ListPage'));
const ContainerImageTargetsListPage = lazy(
  () =>
    import('web/pages/container-image-targets/ContainerImageTargetsListPage'),
);
const CpeDetailsPage = lazy(() => import('web/pages/cpes/DetailsPage'));
const CpesPage = lazy(() => import('web/pages/cpes/ListPage'));
const CredentialStorePage = lazy(
  () => import('web/pages/credential-store/CredentialStorePage'),
);
const CredentialDetailsPage = lazy(
  () => import('web/pages/credentials/DetailsPage'),
);
const CredentialsPage = lazy(() => import('web/pages/credentials/ListPage'));
const CveDetailsPage = lazy(() => import('web/pages/cves/DetailsPage'));
const CvesPage = lazy(() => import('web/pages/cves/ListPage'));
const DfnCertDetailsPage = lazy(() => import('web/pages/dfncert/DetailsPage'));
const DfnCertsPage = lazy(() => import('web/pages/dfncert/ListPage'));
const CvssCalculatorPage = lazy(
  () => import('web/pages/extras/CvssCalculatorPage'),
);
const FeedStatusPage = lazy(() => import('web/pages/extras/FeedStatusPage'));
const FilterDetailsPage = lazy(() => import('web/pages/filters/DetailsPage'));
const FiltersPage = lazy(() => import('web/pages/filters/ListPage'));
const GroupDetailsPage = lazy(() => import('web/pages/groups/DetailsPage'));
const GroupsPage = lazy(() => import('web/pages/groups/ListPage'));
const HostDetailsPage = lazy(() => import('web/pages/hosts/DetailsPage'));
const HostsPage = lazy(() => import('web/pages/hosts/ListPage'));
const LdapPage = lazy(() => import('web/pages/ldap/LdapPage'));
const LoginPage = lazy(() => import('web/pages/login/LoginPage'));
const NoteDetailsPage = lazy(() => import('web/pages/notes/DetailsPage'));
const NotesPage = lazy(() => import('web/pages/notes/ListPage'));
const PageNotFound = lazy(() => import('web/pages/NotFoundPage'));
const NvtDetailsPage = lazy(() => import('web/pages/nvts/DetailsPage'));
const NvtsPage = lazy(() => import('web/pages/nvts/ListPage'));
const LegacyOmpPage = lazy(() => import('web/pages/Omp'));
const OperatingSystemDetailsPage = lazy(
  () => import('web/pages/operatingsystems/DetailsPage'),
);
const OperatingSystemsPage = lazy(
  () => import('web/pages/operatingsystems/ListPage'),
);
const OverrideDetailsPage = lazy(
  () => import('web/pages/overrides/DetailsPage'),
);
const OverridesPage = lazy(() => import('web/pages/overrides/ListPage'));
const PerformancePage = lazy(
  () => import('web/pages/performance/PerformancePage'),
);
const PermissionDetailsPage = lazy(
  () => import('web/pages/permissions/PermissionDetailsPage'),
);
const PermissionsPage = lazy(
  () => import('web/pages/permissions/PermissionListPage'),
);
const PoliciesDetailsPage = lazy(
  () => import('web/pages/policies/DetailsPage'),
);
const PoliciesPage = lazy(() => import('web/pages/policies/ListPage'));
const PortListDetailsPage = lazy(
  () => import('web/pages/portlists/PortListDetailsPage'),
);
const PortListsPage = lazy(
  () => import('web/pages/portlists/PortListListPage'),
);
const RadiusPage = lazy(() => import('web/pages/radius/RadiusPage'));
const ReportConfigDetailsPage = lazy(
  () => import('web/pages/reportconfigs/DetailsPage'),
);
const ReportConfigsPage = lazy(
  () => import('web/pages/reportconfigs/ListPage'),
);
const ReportFormatDetailsPage = lazy(
  () => import('web/pages/reportformats/DetailsPage'),
);
const ReportFormatsPage = lazy(
  () => import('web/pages/reportformats/ListPage'),
);
const DeltaAuditReportDetailsPage = lazy(
  () => import('web/pages/reports/AuditDeltaDetailsPage'),
);
const AuditReportDetailsPage = lazy(
  () => import('web/pages/reports/AuditDetailsPage'),
);
const AuditReportsPage = lazy(
  () => import('web/pages/reports/AuditReportsListPage'),
);
const DeltaReportDetailsPage = lazy(
  () => import('web/pages/reports/DeltaDetailsPage'),
);
const ReportDetailsPage = lazy(() => import('web/pages/reports/DetailsPage'));
const ReportsPage = lazy(() => import('web/pages/reports/ReportListPage'));
const ResultDetailsPage = lazy(() => import('web/pages/results/DetailsPage'));
const ResultsPage = lazy(() => import('web/pages/results/ListPage'));
const RoleDetailsPage = lazy(() => import('web/pages/roles/RoleDetailsPage'));
const RoleListPage = lazy(() => import('web/pages/roles/RoleListPage'));
const ScanConfigDetailsPage = lazy(
  () => import('web/pages/scanconfigs/DetailsPage'),
);
const ScanConfigsPage = lazy(() => import('web/pages/scanconfigs/ListPage'));
const ScannerDetailsPage = lazy(
  () => import('web/pages/scanners/ScannerDetailsPage'),
);
const ScannersPage = lazy(() => import('web/pages/scanners/ScannerListPage'));
const ScheduleDetailsPage = lazy(
  () => import('web/pages/schedules/DetailsPage'),
);
const SchedulesPage = lazy(() => import('web/pages/schedules/ListPage'));
const StartPage = lazy(() => import('web/pages/start/StartPage'));
const TagDetailsPage = lazy(() => import('web/pages/tags/DetailsPage'));
const TagsPage = lazy(() => import('web/pages/tags/ListPage'));
const TargetDetailsPage = lazy(() => import('web/pages/targets/DetailsPage'));
const TargetsPage = lazy(() => import('web/pages/targets/ListPage'));
const TaskDetailsPage = lazy(() => import('web/pages/tasks/TaskDetailsPage'));
const TasksPage = lazy(() => import('web/pages/tasks/TaskListPage'));
const TicketDetailsPage = lazy(() => import('web/pages/tickets/DetailsPage'));
const TicketsPage = lazy(() => import('web/pages/tickets/ListPage'));
const TlsCertificateDetailsPage = lazy(
  () => import('web/pages/tlscertificates/DetailsPage'),
);
const TlsCertificatesPage = lazy(
  () => import('web/pages/tlscertificates/ListPage'),
);
const TrashcanPage = lazy(() => import('web/pages/trashcan/TrashCanPage'));
const UserSettingsPage = lazy(
  () => import('web/pages/user-settings/UserSettingsPage'),
);
const UserDetailsPage = lazy(() => import('web/pages/users/DetailsPage'));
const UsersPage = lazy(() => import('web/pages/users/ListPage'));
const VulnerabilitiesPage = lazy(() => import('web/pages/vulns/ListPage'));

const LoggedOutRoutes = () => {
  const location = useLocation();
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route element={<LoginPage />} path="/login" />
        <Route element={<LegacyOmpPage />} path="/omp" />
        <Route
          element={<Navigate state={{from: location}} to="/login" />}
          path="*"
        />
      </Routes>
    </Suspense>
  );
};

const LoggedInRoutes = () => {
  return (
    <Authorized>
      <SessionTracker />
      <SessionObserver />
      <Page>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<StartPage />} path="/dashboards" />
            <Route
              element={<AgentInstallerListPage />}
              path="/agent-installers"
            />
            <Route element={<AgentListPage />} path="/agents" />
            <Route element={<AgentGroupsListPage />} path="/agent-groups" />
            <Route element={<AlertsPage />} path="/alerts" />
            <Route element={<AuditsPage />} path="/audits" />
            <Route element={<CertBundsPage />} path="/certbunds" />
            <Route
              element={<ContainerImageTargetsListPage />}
              path="/ociimagetargets"
            />
            <Route element={<CpesPage />} path="/cpes" />
            <Route element={<CredentialsPage />} path="/credentials" />
            <Route element={<CredentialStorePage />} path="/credentialstore" />
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
            <Route element={<RoleListPage />} path="/roles" />
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
        </Suspense>
      </Page>
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
