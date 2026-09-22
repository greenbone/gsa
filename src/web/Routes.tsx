/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  redirect,
} from 'react-router';
import {ROUTES} from 'routePaths';
import Authorized from 'web/Authorized';
import Loading from 'web/components/loading/Loading';
import SessionObserver from 'web/components/observer/SessionObserver';
import SessionTracker from 'web/components/observer/SessionTracker';
import useUserIsLoggedIn from 'web/hooks/useUserIsLoggedIn';
import LoginPageRoute from 'web/pages/login/LoginPageRoute';
import Page from 'web/pages/Page';

// Layout components
const LoggedOutLayout = () => <Outlet />;

const LoggedInLayout = () => {
  const isLoggedIn = useUserIsLoggedIn();
  if (!isLoggedIn) {
    return <Navigate replace to={ROUTES.login.url} />;
  }
  return (
    <Authorized>
      <SessionTracker />
      <SessionObserver />
      <Page>
        <Outlet />
      </Page>
    </Authorized>
  );
};

const loggedInRoutes = [
  {
    path: '/',
    element: <LoggedInLayout />,
    HydrateFallback: Loading,
    children: [
      // Dashboard
      {
        path: ROUTES.dashboards.path,
        lazy: async () => ({
          Component: (await import('web/pages/start/StartPage')).default,
        }),
      },

      // Agent routes
      {
        path: ROUTES.agentInstallers.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/agent-remote-installer/AgentInstallInstructionsPage')
          ).default,
        }),
      },
      {
        path: ROUTES.agents.path,
        lazy: async () => ({
          Component: (await import('web/pages/agents/AgentListPage')).default,
        }),
      },
      {
        path: ROUTES.agentGroups.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/agent-groups/AgentGroupsListPage')
          ).default,
        }),
      },

      // Alert routes
      {
        path: ROUTES.alerts.path,
        lazy: async () => ({
          Component: (await import('web/pages/alerts/ListPage')).default,
        }),
      },
      {
        path: ROUTES.alert.path,
        lazy: async () => ({
          Component: (await import('web/pages/alerts/DetailsPage')).default,
        }),
      },

      // Audit routes
      {
        path: ROUTES.audits.path,
        lazy: async () => ({
          Component: (await import('web/pages/audits/ListPage')).default,
        }),
      },
      {
        path: ROUTES.audit.path,
        lazy: async () => ({
          Component: (await import('web/pages/audits/DetailsPage')).default,
        }),
      },

      {
        path: ROUTES.legacy.auditReports.path,
        loader: () => {
          throw redirect(ROUTES.auditReports.url);
        },
      },
      {
        path: ROUTES.auditReports.path,
        lazy: async () => ({
          Component: (await import('web/pages/reports/AuditReportsListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.auditReportDelta.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/reports/AuditDeltaReportDetailsPage')
          ).default,
        }),
      },
      {
        path: ROUTES.legacy.auditReport.path,
        loader: ({params}) => {
          throw redirect(ROUTES.auditReport.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.auditReport.path,
        lazy: async () => ({
          Component: (await import('web/pages/reports/AuditReportDetailsPage'))
            .default,
        }),
      },

      // CERT-Bund routes
      {
        path: ROUTES.legacy.certBundAdvisories.path,
        loader: () => {
          throw redirect(ROUTES.certBundAdvisories.url);
        },
      },
      {
        path: ROUTES.certBundAdvisories.path,
        lazy: async () => ({
          Component: (await import('web/pages/certbund/ListPage')).default,
        }),
      },
      {
        path: ROUTES.legacy.certBundAdvisory.path,
        loader: ({params}) => {
          throw redirect(ROUTES.certBundAdvisory.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.certBundAdvisory.path,
        lazy: async () => ({
          Component: (await import('web/pages/certbund/DetailsPage')).default,
        }),
      },

      // Container Image Target routes
      {
        path: ROUTES.legacy.ociImageTargets.path,
        loader: () => {
          throw redirect(ROUTES.ociImageTargets.url);
        },
      },
      {
        path: ROUTES.ociImageTargets.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/container-image-targets/ContainerImageTargetsListPage')
          ).default,
        }),
      },

      {
        path: ROUTES.legacy.webApplicationTargets.path,
        loader: () => {
          throw redirect(ROUTES.webApplicationTargets.url);
        },
      },
      {
        path: ROUTES.webApplicationTargets.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/web-application-targets/WebApplicationTargetsListPage')
          ).default,
        }),
      },

      // CPE routes
      {
        path: ROUTES.cpes.path,
        lazy: async () => ({
          Component: (await import('web/pages/cpes/ListPage')).default,
        }),
      },
      {
        path: ROUTES.cpe.path,
        lazy: async () => ({
          Component: (await import('web/pages/cpes/DetailsPage')).default,
        }),
      },

      // Credential routes
      {
        path: ROUTES.credentials.path,
        lazy: async () => ({
          Component: (await import('web/pages/credentials/CredentialListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.credential.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/credentials/CredentialDetailsPage')
          ).default,
        }),
      },

      {
        path: ROUTES.legacy.credentialStore.path,
        loader: () => {
          throw redirect(ROUTES.credentialStore.url);
        },
      },
      {
        path: ROUTES.credentialStore.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/credential-store/CredentialStorePage')
          ).default,
        }),
      },

      // CVE routes
      {
        path: ROUTES.cves.path,
        lazy: async () => ({
          Component: (await import('web/pages/cves/ListPage')).default,
        }),
      },
      {
        path: ROUTES.cve.path,
        lazy: async () => ({
          Component: (await import('web/pages/cves/DetailsPage')).default,
        }),
      },

      // DFN-CERT routes
      {
        path: ROUTES.legacy.dfnCertAdvisories.path,
        loader: () => {
          throw redirect(ROUTES.dfnCertAdvisories.url);
        },
      },
      {
        path: ROUTES.dfnCertAdvisories.path,
        lazy: async () => ({
          Component: (await import('web/pages/dfncert/ListPage')).default,
        }),
      },
      {
        path: ROUTES.legacy.dfnCertAdvisory.path,
        loader: ({params}) => {
          throw redirect(ROUTES.dfnCertAdvisory.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.dfnCertAdvisory.path,
        lazy: async () => ({
          Component: (await import('web/pages/dfncert/DetailsPage')).default,
        }),
      },

      // Feed Status route
      {
        path: ROUTES.legacy.feedStatus.path,
        loader: () => {
          throw redirect(ROUTES.feedStatus.url);
        },
      },
      {
        path: ROUTES.feedStatus.path,
        lazy: async () => ({
          Component: (await import('web/pages/extras/FeedStatusPage')).default,
        }),
      },

      // Filter routes
      {
        path: ROUTES.filters.path,
        lazy: async () => ({
          Component: (await import('web/pages/filters/ListPage')).default,
        }),
      },
      {
        path: ROUTES.filter.path,
        lazy: async () => ({
          Component: (await import('web/pages/filters/DetailsPage')).default,
        }),
      },

      // Group routes
      {
        path: ROUTES.groups.path,
        lazy: async () => ({
          Component: (await import('web/pages/groups/ListPage')).default,
        }),
      },
      {
        path: ROUTES.group.path,
        lazy: async () => ({
          Component: (await import('web/pages/groups/DetailsPage')).default,
        }),
      },

      // Host routes
      {
        path: ROUTES.hosts.path,
        lazy: async () => ({
          Component: (await import('web/pages/hosts/ListPage')).default,
        }),
      },
      {
        path: ROUTES.host.path,
        lazy: async () => ({
          Component: (await import('web/pages/hosts/DetailsPage')).default,
        }),
      },

      // LDAP route
      {
        path: ROUTES.ldap.path,
        lazy: async () => ({
          Component: (await import('web/pages/ldap/LdapPage')).default,
        }),
      },

      // Note routes
      {
        path: ROUTES.notes.path,
        lazy: async () => ({
          Component: (await import('web/pages/notes/NoteListPage')).default,
        }),
      },
      {
        path: ROUTES.note.path,
        lazy: async () => ({
          Component: (await import('web/pages/notes/NoteDetailsPage')).default,
        }),
      },

      // NVT routes
      {
        path: ROUTES.nvts.path,
        lazy: async () => ({
          Component: (await import('web/pages/nvts/ListPage')).default,
        }),
      },
      {
        path: ROUTES.nvt.path,
        lazy: async () => ({
          Component: (await import('web/pages/nvts/DetailsPage')).default,
        }),
      },

      // Operating System routes
      {
        path: ROUTES.legacy.operatingSystems.path,
        loader: () => {
          throw redirect(ROUTES.operatingSystems.url);
        },
      },
      {
        path: ROUTES.operatingSystems.path,
        lazy: async () => ({
          Component: (await import('web/pages/operatingsystems/ListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.legacy.operatingSystem.path,
        loader: ({params}) => {
          throw redirect(ROUTES.operatingSystem.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.operatingSystem.path,
        lazy: async () => ({
          Component: (await import('web/pages/operatingsystems/DetailsPage'))
            .default,
        }),
      },

      // Override routes
      {
        path: ROUTES.overrides.path,
        lazy: async () => ({
          Component: (await import('web/pages/overrides/OverrideListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.override.path,
        lazy: async () => ({
          Component: (await import('web/pages/overrides/OverrideDetailsPage'))
            .default,
        }),
      },

      // Performance route
      {
        path: ROUTES.performance.path,
        lazy: async () => ({
          Component: (await import('web/pages/performance/PerformancePage'))
            .default,
        }),
      },

      // Permission routes
      {
        path: ROUTES.permissions.path,
        lazy: async () => ({
          Component: (await import('web/pages/permissions/PermissionListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.permission.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/permissions/PermissionDetailsPage')
          ).default,
        }),
      },

      // Policy routes
      {
        path: ROUTES.policies.path,
        lazy: async () => ({
          Component: (await import('web/pages/policies/ListPage')).default,
        }),
      },
      {
        path: ROUTES.policy.path,
        lazy: async () => ({
          Component: (await import('web/pages/policies/DetailsPage')).default,
        }),
      },

      // Port List routes
      {
        path: ROUTES.legacy.portLists.path,
        loader: () => {
          throw redirect(ROUTES.portLists.url);
        },
      },
      {
        path: ROUTES.portLists.path,
        lazy: async () => ({
          Component: (await import('web/pages/portlists/PortListListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.legacy.portList.path,
        loader: ({params}) => {
          throw redirect(ROUTES.portList.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.portList.path,
        lazy: async () => ({
          Component: (await import('web/pages/portlists/PortListDetailsPage'))
            .default,
        }),
      },

      // RADIUS route
      {
        path: ROUTES.radius.path,
        lazy: async () => ({
          Component: (await import('web/pages/radius/RadiusPage')).default,
        }),
      },

      // Report routes
      {
        path: ROUTES.reports.path,
        lazy: async () => ({
          Component: (await import('web/pages/reports/ReportListPage')).default,
        }),
      },
      {
        path: ROUTES.reportDelta.path,
        lazy: async () => ({
          Component: (await import('web/pages/reports/DeltaDetailsPage'))
            .default,
        }),
      },
      {
        path: ROUTES.report.path,
        lazy: async () => ({
          Component: (await import('web/pages/reports/ReportDetailsPage'))
            .default,
        }),
      },

      // Report Config routes
      {
        path: ROUTES.legacy.reportConfigs.path,
        loader: () => {
          throw redirect(ROUTES.reportConfigs.url);
        },
      },
      {
        path: ROUTES.reportConfigs.path,
        lazy: async () => ({
          Component: (await import('web/pages/reportconfigs/ListPage')).default,
        }),
      },
      {
        path: ROUTES.legacy.reportConfig.path,
        loader: ({params}) => {
          throw redirect(ROUTES.reportConfig.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.reportConfig.path,
        lazy: async () => ({
          Component: (await import('web/pages/reportconfigs/DetailsPage'))
            .default,
        }),
      },

      // Report Format routes
      {
        path: ROUTES.legacy.reportFormats.path,
        loader: () => {
          throw redirect(ROUTES.reportFormats.url);
        },
      },
      {
        path: ROUTES.reportFormats.path,
        lazy: async () => ({
          Component: (await import('web/pages/reportformats/ListPage')).default,
        }),
      },
      {
        path: ROUTES.legacy.reportFormat.path,
        loader: ({params}) => {
          throw redirect(ROUTES.reportFormat.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.reportFormat.path,
        lazy: async () => ({
          Component: (await import('web/pages/reportformats/DetailsPage'))
            .default,
        }),
      },

      // Result routes
      {
        path: ROUTES.results.path,
        lazy: async () => ({
          Component: (await import('web/pages/results/ListPage')).default,
        }),
      },
      {
        path: ROUTES.result.path,
        lazy: async () => ({
          Component: (await import('web/pages/results/DetailsPage')).default,
        }),
      },

      // Role routes
      {
        path: ROUTES.roles.path,
        lazy: async () => ({
          Component: (await import('web/pages/roles/RoleListPage')).default,
        }),
      },
      {
        path: ROUTES.role.path,
        lazy: async () => ({
          Component: (await import('web/pages/roles/RoleDetailsPage')).default,
        }),
      },

      // Scan Config routes
      {
        path: ROUTES.legacy.scanConfigs.path,
        loader: () => {
          throw redirect(ROUTES.scanConfigs.url);
        },
      },
      {
        path: ROUTES.scanConfigs.path,
        lazy: async () => ({
          Component: (await import('web/pages/scanconfigs/ListPage')).default,
        }),
      },
      {
        path: ROUTES.legacy.scanConfig.path,
        loader: ({params}) => {
          throw redirect(ROUTES.scanConfig.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.scanConfig.path,
        lazy: async () => ({
          Component: (await import('web/pages/scanconfigs/DetailsPage'))
            .default,
        }),
      },

      // Scanner routes
      {
        path: ROUTES.scanners.path,
        lazy: async () => ({
          Component: (await import('web/pages/scanners/ScannerListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.scanner.path,
        lazy: async () => ({
          Component: (await import('web/pages/scanners/ScannerDetailsPage'))
            .default,
        }),
      },

      // Schedule routes
      {
        path: ROUTES.schedules.path,
        lazy: async () => ({
          Component: (await import('web/pages/schedules/ListPage')).default,
        }),
      },
      {
        path: ROUTES.schedule.path,
        lazy: async () => ({
          Component: (await import('web/pages/schedules/DetailsPage')).default,
        }),
      },

      // Tag routes
      {
        path: ROUTES.tags.path,
        lazy: async () => ({
          Component: (await import('web/pages/tags/TagListPage')).default,
        }),
      },
      {
        path: ROUTES.tag.path,
        lazy: async () => ({
          Component: (await import('web/pages/tags/TagDetailsPage')).default,
        }),
      },

      // Target routes
      {
        path: ROUTES.targets.path,
        lazy: async () => ({
          Component: (await import('web/pages/targets/TargetListPage')).default,
        }),
      },
      {
        path: ROUTES.target.path,
        lazy: async () => ({
          Component: (await import('web/pages/targets/TargetDetailsPage'))
            .default,
        }),
      },

      // Task routes
      {
        path: ROUTES.tasks.path,
        lazy: async () => ({
          Component: (await import('web/pages/tasks/TaskListPage')).default,
        }),
      },
      {
        path: ROUTES.task.path,
        lazy: async () => ({
          Component: (await import('web/pages/tasks/TaskDetailsPage')).default,
        }),
      },

      // Ticket routes
      {
        path: ROUTES.tickets.path,
        lazy: async () => ({
          Component: (await import('web/pages/tickets/TicketsListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.ticket.path,
        lazy: async () => ({
          Component: (await import('web/pages/tickets/TicketDetailsPage'))
            .default,
        }),
      },

      // TLS Certificate routes
      {
        path: ROUTES.legacy.tlsCertificates.path,
        loader: () => {
          throw redirect(ROUTES.tlsCertificates.url);
        },
      },
      {
        path: ROUTES.tlsCertificates.path,
        lazy: async () => ({
          Component: (await import('web/pages/tlscertificates/ListPage'))
            .default,
        }),
      },
      {
        path: ROUTES.legacy.tlsCertificate.path,
        loader: ({params}) => {
          throw redirect(ROUTES.tlsCertificate.url(params.id ?? ''));
        },
      },
      {
        path: ROUTES.tlsCertificate.path,
        lazy: async () => ({
          Component: (await import('web/pages/tlscertificates/DetailsPage'))
            .default,
        }),
      },

      // Trashcan route
      {
        path: ROUTES.trashcan.path,
        lazy: async () => ({
          Component: (await import('web/pages/trashcan/TrashCanPage')).default,
        }),
      },

      // User routes
      {
        path: ROUTES.users.path,
        lazy: async () => ({
          Component: (await import('web/pages/users/UsersListPage')).default,
        }),
      },
      {
        path: ROUTES.user.path,
        lazy: async () => ({
          Component: (await import('web/pages/users/UserDetailsPage')).default,
        }),
      },

      // User Settings route
      {
        path: ROUTES.legacy.userSettings.path,
        loader: () => {
          throw redirect(ROUTES.userSettings.url);
        },
      },
      {
        path: ROUTES.userSettings.path,
        lazy: async () => ({
          Component: (await import('web/pages/user-settings/UserSettingsPage'))
            .default,
        }),
      },

      // Vulnerability routes
      {
        path: ROUTES.vulnerabilities.path,
        lazy: async () => ({
          Component: (
            await import('web/pages/vulnerabilities/VulnerabilitiesListPage')
          ).default,
        }),
      },

      // CVSS Calculator route
      {
        path: ROUTES.legacy.cvssCalculator.path,
        loader: () => {
          throw redirect(ROUTES.cvssCalculator.url);
        },
      },
      {
        path: ROUTES.cvssCalculator.path,
        lazy: async () => ({
          Component: (await import('web/pages/extras/CvssCalculatorPage'))
            .default,
        }),
      },

      // Special routes
      {
        path: ROUTES.legacy.notFound.path,
        loader: () => {
          throw redirect(ROUTES.notFound.url);
        },
      },
      {
        path: ROUTES.notFound.path,
        lazy: async () => ({
          Component: (await import('web/pages/NotFoundPage')).default,
        }),
      },

      // Root redirect for logged-in users
      {
        index: true,
        element: <Navigate to={ROUTES.dashboards.url} />,
      },

      // Catch all for logged-in users
      {
        path: '*',
        lazy: async () => ({
          Component: (await import('web/pages/NotFoundPage')).default,
        }),
      },
    ],
  },
];

const AuthRedirect = () => {
  const isLoggedIn = useUserIsLoggedIn();
  return isLoggedIn ? (
    <Navigate to={ROUTES.dashboards.url} />
  ) : (
    <Navigate replace to={ROUTES.login.url} />
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoggedOutLayout />,
    HydrateFallback: Loading,
    children: [
      {
        index: true,
        element: <AuthRedirect />,
      },
      {
        path: ROUTES.login.path,
        element: <LoginPageRoute />,
      },
      {
        path: ROUTES.omp.path,
        lazy: async () => ({
          Component: (await import('web/pages/OmpPage')).default,
        }),
      },
      {
        path: '*',
        element: <AuthRedirect />,
      },
    ],
  },
  ...loggedInRoutes,
]);

const AppRoutes = () => <RouterProvider router={router} />;

export default AppRoutes;
