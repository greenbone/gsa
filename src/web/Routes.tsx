/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
  useLocation,
  redirect,
} from 'react-router';
import Authorized from 'web/Authorized';
import Loading from 'web/components/loading/Loading';
import SessionObserver from 'web/components/observer/SessionObserver';
import SessionTracker from 'web/components/observer/SessionTracker';
import Page from 'web/pages/Page';
import {isLoggedIn as selectIsLoggedIn} from 'web/store/usersettings/selectors';

// Layout components
const LoggedOutLayout = () => <Outlet />;

const LoggedInLayout = () => (
  <Authorized>
    <SessionTracker />
    <SessionObserver />
    <Page>
      <Outlet />
    </Page>
  </Authorized>
);

// Custom redirect component that preserves location state
const RedirectToLogin = () => {
  const location = useLocation();
  return <Navigate replace state={{from: location}} to="/login" />;
};

const loggedInRoutes = [
  {
    path: '/',
    element: <LoggedInLayout />,
    HydrateFallback: Loading,
    children: [
      // Dashboard
      {
        path: 'dashboards',
        lazy: async () => ({
          Component: (await import('web/pages/start/StartPage')).default,
        }),
      },

      // Agent routes
      {
        path: 'agent-installers',
        lazy: async () => ({
          Component: (
            await import('web/pages/agent-installers/AgentInstallerListPage')
          ).default,
        }),
      },
      {
        path: 'agents',
        lazy: async () => ({
          Component: (await import('web/pages/agents/AgentListPage')).default,
        }),
      },
      {
        path: 'agent-groups',
        lazy: async () => ({
          Component: (
            await import('web/pages/agent-groups/AgentGroupsListPage')
          ).default,
        }),
      },

      // Alert routes
      {
        path: 'alerts',
        lazy: async () => ({
          Component: (await import('web/pages/alerts/ListPage')).default,
        }),
      },
      {
        path: 'alert/:id',
        lazy: async () => ({
          Component: (await import('web/pages/alerts/DetailsPage')).default,
        }),
      },

      // Audit routes
      {
        path: 'audits',
        lazy: async () => ({
          Component: (await import('web/pages/audits/ListPage')).default,
        }),
      },
      {
        path: 'audit/:id',
        lazy: async () => ({
          Component: (await import('web/pages/audits/DetailsPage')).default,
        }),
      },

      {
        path: 'auditreports',
        loader: () => {
          throw redirect('/audit-reports');
        },
      },
      {
        path: 'audit-reports',
        lazy: async () => ({
          Component: (await import('web/pages/reports/AuditReportsListPage'))
            .default,
        }),
      },
      {
        path: 'audit-report/delta/:id/:deltaid',
        lazy: async () => ({
          Component: (
            await import('web/pages/reports/AuditDeltaReportDetailsPage')
          ).default,
        }),
      },
      {
        path: 'auditreport/:id',
        loader: ({params}) => {
          throw redirect(`/audit-report/${params.id}`);
        },
      },
      {
        path: 'audit-report/:id',
        lazy: async () => ({
          Component: (await import('web/pages/reports/AuditReportDetailsPage'))
            .default,
        }),
      },

      // CERT-Bund routes
      {
        path: 'certbunds',
        loader: () => {
          throw redirect('/cert-bund-advisories');
        },
      },
      {
        path: 'cert-bund-advisories',
        lazy: async () => ({
          Component: (await import('web/pages/certbund/ListPage')).default,
        }),
      },
      {
        path: 'certbund/:id',
        loader: ({params}) => {
          throw redirect(`/cert-bund-advisory/${params.id}`);
        },
      },
      {
        path: 'cert-bund-advisory/:id',
        lazy: async () => ({
          Component: (await import('web/pages/certbund/DetailsPage')).default,
        }),
      },

      // Container Image Target routes
      {
        path: 'ociimagetargets',
        loader: () => {
          throw redirect('/oci-image-targets');
        },
      },
      {
        path: 'oci-image-targets',
        lazy: async () => ({
          Component: (
            await import('web/pages/container-image-targets/ContainerImageTargetsListPage')
          ).default,
        }),
      },

      // CPE routes
      {
        path: 'cpes',
        lazy: async () => ({
          Component: (await import('web/pages/cpes/ListPage')).default,
        }),
      },
      {
        path: 'cpe/:id',
        lazy: async () => ({
          Component: (await import('web/pages/cpes/DetailsPage')).default,
        }),
      },

      // Credential routes
      {
        path: 'credentials',
        lazy: async () => ({
          Component: (await import('web/pages/credentials/CredentialListPage'))
            .default,
        }),
      },
      {
        path: 'credential/:id',
        lazy: async () => ({
          Component: (
            await import('web/pages/credentials/CredentialDetailsPage')
          ).default,
        }),
      },

      {
        path: 'credentialstore',
        loader: () => {
          throw redirect('/credential-store');
        },
      },
      {
        path: 'credential-store',
        lazy: async () => ({
          Component: (
            await import('web/pages/credential-store/CredentialStorePage')
          ).default,
        }),
      },

      // CVE routes
      {
        path: 'cves',
        lazy: async () => ({
          Component: (await import('web/pages/cves/ListPage')).default,
        }),
      },
      {
        path: 'cve/:id',
        lazy: async () => ({
          Component: (await import('web/pages/cves/DetailsPage')).default,
        }),
      },

      // DFN-CERT routes
      {
        path: 'dfncerts',
        loader: () => {
          throw redirect('/dfn-cert-advisories');
        },
      },
      {
        path: 'dfn-cert-advisories',
        lazy: async () => ({
          Component: (await import('web/pages/dfncert/ListPage')).default,
        }),
      },
      {
        path: 'dfncert/:id',
        loader: ({params}) => {
          throw redirect(`/dfn-cert-advisory/${params.id}`);
        },
      },
      {
        path: 'dfn-cert-advisory/:id',
        lazy: async () => ({
          Component: (await import('web/pages/dfncert/DetailsPage')).default,
        }),
      },

      // Feed Status route
      {
        path: 'feedstatus',
        loader: () => {
          throw redirect('/feed-status');
        },
      },
      {
        path: 'feed-status',
        lazy: async () => ({
          Component: (await import('web/pages/extras/FeedStatusPage')).default,
        }),
      },

      // Filter routes
      {
        path: 'filters',
        lazy: async () => ({
          Component: (await import('web/pages/filters/ListPage')).default,
        }),
      },
      {
        path: 'filter/:id',
        lazy: async () => ({
          Component: (await import('web/pages/filters/DetailsPage')).default,
        }),
      },

      // Group routes
      {
        path: 'groups',
        lazy: async () => ({
          Component: (await import('web/pages/groups/ListPage')).default,
        }),
      },
      {
        path: 'group/:id',
        lazy: async () => ({
          Component: (await import('web/pages/groups/DetailsPage')).default,
        }),
      },

      // Host routes
      {
        path: 'hosts',
        lazy: async () => ({
          Component: (await import('web/pages/hosts/ListPage')).default,
        }),
      },
      {
        path: 'host/:id',
        lazy: async () => ({
          Component: (await import('web/pages/hosts/DetailsPage')).default,
        }),
      },

      // LDAP route
      {
        path: 'ldap',
        lazy: async () => ({
          Component: (await import('web/pages/ldap/LdapPage')).default,
        }),
      },

      // Note routes
      {
        path: 'notes',
        lazy: async () => ({
          Component: (await import('web/pages/notes/ListPage')).default,
        }),
      },
      {
        path: 'note/:id',
        lazy: async () => ({
          Component: (await import('web/pages/notes/DetailsPage')).default,
        }),
      },

      // NVT routes
      {
        path: 'nvts',
        lazy: async () => ({
          Component: (await import('web/pages/nvts/ListPage')).default,
        }),
      },
      {
        path: 'nvt/:id',
        lazy: async () => ({
          Component: (await import('web/pages/nvts/DetailsPage')).default,
        }),
      },

      // Operating System routes
      {
        path: 'operatingsystems',
        loader: () => {
          throw redirect('/operating-systems');
        },
      },
      {
        path: 'operating-systems',
        lazy: async () => ({
          Component: (await import('web/pages/operatingsystems/ListPage'))
            .default,
        }),
      },
      {
        path: 'operatingsystem/:id',
        loader: ({params}) => {
          throw redirect(`/operating-system/${params.id}`);
        },
      },
      {
        path: 'operating-system/:id',
        lazy: async () => ({
          Component: (await import('web/pages/operatingsystems/DetailsPage'))
            .default,
        }),
      },

      // Override routes
      {
        path: 'overrides',
        lazy: async () => ({
          Component: (await import('web/pages/overrides/ListPage')).default,
        }),
      },
      {
        path: 'override/:id',
        lazy: async () => ({
          Component: (await import('web/pages/overrides/DetailsPage')).default,
        }),
      },

      // Performance route
      {
        path: 'performance',
        lazy: async () => ({
          Component: (await import('web/pages/performance/PerformancePage'))
            .default,
        }),
      },

      // Permission routes
      {
        path: 'permissions',
        lazy: async () => ({
          Component: (await import('web/pages/permissions/PermissionListPage'))
            .default,
        }),
      },
      {
        path: 'permission/:id',
        lazy: async () => ({
          Component: (
            await import('web/pages/permissions/PermissionDetailsPage')
          ).default,
        }),
      },

      // Policy routes
      {
        path: 'policies',
        lazy: async () => ({
          Component: (await import('web/pages/policies/ListPage')).default,
        }),
      },
      {
        path: 'policy/:id',
        lazy: async () => ({
          Component: (await import('web/pages/policies/DetailsPage')).default,
        }),
      },

      // Port List routes
      {
        path: 'portlists',
        loader: () => {
          throw redirect('/port-lists');
        },
      },
      {
        path: 'port-lists',
        lazy: async () => ({
          Component: (await import('web/pages/portlists/PortListListPage'))
            .default,
        }),
      },
      {
        path: 'portlist/:id',
        loader: ({params}) => {
          throw redirect(`/port-list/${params.id}`);
        },
      },
      {
        path: 'port-list/:id',
        lazy: async () => ({
          Component: (await import('web/pages/portlists/PortListDetailsPage'))
            .default,
        }),
      },

      // RADIUS route
      {
        path: 'radius',
        lazy: async () => ({
          Component: (await import('web/pages/radius/RadiusPage')).default,
        }),
      },

      // Report routes
      {
        path: 'reports',
        lazy: async () => ({
          Component: (await import('web/pages/reports/ReportListPage')).default,
        }),
      },
      {
        path: 'report/delta/:id/:deltaid',
        lazy: async () => ({
          Component: (await import('web/pages/reports/DeltaDetailsPage'))
            .default,
        }),
      },
      {
        path: 'report/:id',
        lazy: async () => ({
          Component: (await import('web/pages/reports/DetailsPage')).default,
        }),
      },

      // Report Config routes
      {
        path: 'reportconfigs',
        loader: () => {
          throw redirect('/report-configs');
        },
      },
      {
        path: 'report-configs',
        lazy: async () => ({
          Component: (await import('web/pages/reportconfigs/ListPage')).default,
        }),
      },
      {
        path: 'reportconfig/:id',
        loader: ({params}) => {
          throw redirect(`/report-config/${params.id}`);
        },
      },
      {
        path: 'report-config/:id',
        lazy: async () => ({
          Component: (await import('web/pages/reportconfigs/DetailsPage'))
            .default,
        }),
      },

      // Report Format routes
      {
        path: 'reportformats',
        loader: () => {
          throw redirect('/report-formats');
        },
      },
      {
        path: 'report-formats',
        lazy: async () => ({
          Component: (await import('web/pages/reportformats/ListPage')).default,
        }),
      },
      {
        path: 'reportformat/:id',
        loader: ({params}) => {
          throw redirect(`/report-format/${params.id}`);
        },
      },
      {
        path: 'report-format/:id',
        lazy: async () => ({
          Component: (await import('web/pages/reportformats/DetailsPage'))
            .default,
        }),
      },

      // Result routes
      {
        path: 'results',
        lazy: async () => ({
          Component: (await import('web/pages/results/ListPage')).default,
        }),
      },
      {
        path: 'result/:id',
        lazy: async () => ({
          Component: (await import('web/pages/results/DetailsPage')).default,
        }),
      },

      // Role routes
      {
        path: 'roles',
        lazy: async () => ({
          Component: (await import('web/pages/roles/RoleListPage')).default,
        }),
      },
      {
        path: 'role/:id',
        lazy: async () => ({
          Component: (await import('web/pages/roles/RoleDetailsPage')).default,
        }),
      },

      // Scan Config routes
      {
        path: 'scanconfigs',
        loader: () => {
          throw redirect('/scan-configs');
        },
      },
      {
        path: 'scan-configs',
        lazy: async () => ({
          Component: (await import('web/pages/scanconfigs/ListPage')).default,
        }),
      },
      {
        path: 'scanconfig/:id',
        loader: ({params}) => {
          throw redirect(`/scan-config/${params.id}`);
        },
      },
      {
        path: 'scan-config/:id',
        lazy: async () => ({
          Component: (await import('web/pages/scanconfigs/DetailsPage'))
            .default,
        }),
      },

      // Scanner routes
      {
        path: 'scanners',
        lazy: async () => ({
          Component: (await import('web/pages/scanners/ScannerListPage'))
            .default,
        }),
      },
      {
        path: 'scanner/:id',
        lazy: async () => ({
          Component: (await import('web/pages/scanners/ScannerDetailsPage'))
            .default,
        }),
      },

      // Schedule routes
      {
        path: 'schedules',
        lazy: async () => ({
          Component: (await import('web/pages/schedules/ListPage')).default,
        }),
      },
      {
        path: 'schedule/:id',
        lazy: async () => ({
          Component: (await import('web/pages/schedules/DetailsPage')).default,
        }),
      },

      // Tag routes
      {
        path: 'tags',
        lazy: async () => ({
          Component: (await import('web/pages/tags/ListPage')).default,
        }),
      },
      {
        path: 'tag/:id',
        lazy: async () => ({
          Component: (await import('web/pages/tags/DetailsPage')).default,
        }),
      },

      // Target routes
      {
        path: 'targets',
        lazy: async () => ({
          Component: (await import('web/pages/targets/TargetListPage')).default,
        }),
      },
      {
        path: 'target/:id',
        lazy: async () => ({
          Component: (await import('web/pages/targets/TargetDetailsPage'))
            .default,
        }),
      },

      // Task routes
      {
        path: 'tasks',
        lazy: async () => ({
          Component: (await import('web/pages/tasks/TaskListPage')).default,
        }),
      },
      {
        path: 'task/:id',
        lazy: async () => ({
          Component: (await import('web/pages/tasks/TaskDetailsPage')).default,
        }),
      },

      // Ticket routes
      {
        path: 'tickets',
        lazy: async () => ({
          Component: (await import('web/pages/tickets/ListPage')).default,
        }),
      },
      {
        path: 'ticket/:id',
        lazy: async () => ({
          Component: (await import('web/pages/tickets/DetailsPage')).default,
        }),
      },

      // TLS Certificate routes
      {
        path: 'tlscertificates',
        loader: () => {
          throw redirect('/tls-certificates');
        },
      },
      {
        path: 'tls-certificates',
        lazy: async () => ({
          Component: (await import('web/pages/tlscertificates/ListPage'))
            .default,
        }),
      },
      {
        path: 'tlscertificate/:id',
        loader: ({params}) => {
          throw redirect(`/tls-certificate/${params.id}`);
        },
      },
      {
        path: 'tls-certificate/:id',
        lazy: async () => ({
          Component: (await import('web/pages/tlscertificates/DetailsPage'))
            .default,
        }),
      },

      // Trashcan route
      {
        path: 'trashcan',
        lazy: async () => ({
          Component: (await import('web/pages/trashcan/TrashCanPage')).default,
        }),
      },

      // User routes
      {
        path: 'users',
        lazy: async () => ({
          Component: (await import('web/pages/users/UsersListPage')).default,
        }),
      },
      {
        path: 'user/:id',
        lazy: async () => ({
          Component: (await import('web/pages/users/DetailsPage')).default,
        }),
      },

      // User Settings route
      {
        path: 'usersettings',
        loader: () => {
          throw redirect('/user-settings');
        },
      },
      {
        path: 'user-settings',
        lazy: async () => ({
          Component: (await import('web/pages/user-settings/UserSettingsPage'))
            .default,
        }),
      },

      // Vulnerability routes
      {
        path: 'vulnerabilities',
        lazy: async () => ({
          Component: (await import('web/pages/vulns/ListPage')).default,
        }),
      },

      // CVSS Calculator route
      {
        path: 'cvsscalculator',
        loader: () => {
          throw redirect('/cvss-calculator');
        },
      },
      {
        path: 'cvss-calculator',
        lazy: async () => ({
          Component: (await import('web/pages/extras/CvssCalculatorPage'))
            .default,
        }),
      },

      // Special routes
      {
        path: 'notfound',
        loader: () => {
          throw redirect('/not-found');
        },
      },
      {
        path: 'not-found',
        lazy: async () => ({
          Component: (await import('web/pages/NotFoundPage')).default,
        }),
      },

      // Root redirect for logged-in users
      {
        index: true,
        element: <Navigate to="/dashboards" />,
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

  // Create router dynamically based on login state
  const router = createBrowserRouter([
    {
      path: '/',
      element: <LoggedOutLayout />,
      HydrateFallback: Loading,
      children: [
        {
          index: true,
          element: isLoggedIn ? (
            <Navigate to="/dashboards" />
          ) : (
            <RedirectToLogin />
          ),
        },
        {
          path: 'login',
          lazy: async () => ({
            Component: (await import('web/pages/login/LoginPage')).default,
          }),
        },
        {
          path: 'omp',
          lazy: async () => ({
            Component: (await import('web/pages/Omp')).default,
          }),
        },
        {
          path: '*',
          element: isLoggedIn ? (
            <Navigate to="/dashboards" />
          ) : (
            <RedirectToLogin />
          ),
        },
      ],
    },
    ...(isLoggedIn ? loggedInRoutes : []),
  ]);

  return <RouterProvider router={router} />;
};

export default AppRoutes;
