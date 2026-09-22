const withId = (path: string, id: string) =>
  `${path}/${encodeURIComponent(id)}`;

export const ROUTES = {
  root: {
    path: '/',
    url: '/',
  },
  login: {
    path: 'login',
    url: '/login',
  },
  omp: {
    path: 'omp',
    url: '/omp',
  },
  dashboards: {
    path: 'dashboards',
    url: '/dashboards',
  },
  auditReports: {
    path: 'audit-reports',
    match: '/audit-reports',
    url: '/audit-reports',
  },
  auditReport: {
    path: 'audit-report/:id',
    match: '/audit-report/*',
    url: (id: string) => withId('/audit-report', id),
  },
  auditReportDelta: {
    path: 'audit-report/delta/:id/:deltaid',
    url: (id: string, deltaId: string) =>
      `${withId('/audit-report/delta', id)}/${encodeURIComponent(deltaId)}`,
  },
  reportDelta: {
    path: 'report/delta/:id/:deltaid',
    url: (id: string, deltaId: string) =>
      `${withId('/report/delta', id)}/${encodeURIComponent(deltaId)}`,
  },
  legacy: {
    auditReports: {
      path: 'auditreports',
      url: '/auditreports',
    },
    auditReport: {
      path: 'auditreport/:id',
      url: (id: string) => withId('/auditreport', id),
    },
  },
  notFound: {
    path: 'not-found',
    url: '/not-found',
  },
} as const;

export type RoutePaths = typeof ROUTES;
