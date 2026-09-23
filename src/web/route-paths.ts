/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {type EntityType} from 'gmp/utils/entity-type';

// Builds a concrete detail URL and encodes the entity ID as one URL segment.
const appendEncodedId = (path: string, id: string) =>
  `${path}/${encodeURIComponent(id)}`;

// Converts a parameterized route pattern into a React Router wildcard match.
export const routeMatch = (path: string) =>
  `/${path.replace(/\/:([^/]+)/g, '/*')}`;

/*
 * Route descriptors keep router patterns and navigable URLs together:
 * - path: relative React Router pattern; dynamic values use placeholders such as :id.
 * - url: absolute URL used by links and navigation; dynamic values are encoded.
 * - match: optional explicit active-menu pattern for routes with special matching needs.
 * - legacy: old URL aliases kept for compatibility and redirected to canonical routes.
 */

export const ROUTES = {
  root: {path: '/', url: '/'},
  login: {path: 'login', url: '/login'},
  omp: {path: 'omp', url: '/omp'},
  dashboards: {path: 'dashboards', url: '/dashboards'},
  agentInstallers: {path: 'agent-installers', url: '/agent-installers'},
  agents: {path: 'agents', url: '/agents'},
  agentGroups: {path: 'agent-groups', url: '/agent-groups'},
  agent: {
    path: 'agent/:id',
    url: (id: string) => appendEncodedId('/agent', id),
  },
  agentGroup: {
    path: 'agent-group/:id',
    url: (id: string) => appendEncodedId('/agent-group', id),
  },
  agentInstaller: {
    path: 'agent-installer/:id',
    url: (id: string) => appendEncodedId('/agent-installer', id),
  },
  alerts: {path: 'alerts', url: '/alerts'},
  alert: {
    path: 'alert/:id',
    url: (id: string) => appendEncodedId('/alert', id),
  },
  audits: {path: 'audits', url: '/audits'},
  audit: {
    path: 'audit/:id',
    url: (id: string) => appendEncodedId('/audit', id),
  },
  auditReports: {
    path: 'audit-reports',
    // Keep this explicit while the menu uses the canonical list path directly.
    match: '/audit-reports',
    url: '/audit-reports',
  },
  auditReport: {
    path: 'audit-report/:id',
    // The detail route needs a wildcard match for active-menu state.
    match: '/audit-report/*',
    url: (id: string) => appendEncodedId('/audit-report', id),
  },
  auditReportDelta: {
    path: 'audit-report/delta/:id/:deltaid',
    url: (id: string, deltaId: string) =>
      `${appendEncodedId('/audit-report/delta', id)}/${encodeURIComponent(deltaId)}`,
  },
  reportDelta: {
    path: 'report/delta/:id/:deltaid',
    url: (id: string, deltaId: string) =>
      `${appendEncodedId('/report/delta', id)}/${encodeURIComponent(deltaId)}`,
  },
  certBundAdvisories: {
    path: 'cert-bund-advisories',
    url: '/cert-bund-advisories',
  },
  certBundAdvisory: {
    path: 'cert-bund-advisory/:id',
    url: (id: string) => appendEncodedId('/cert-bund-advisory', id),
  },
  ociImageTargets: {path: 'oci-image-targets', url: '/oci-image-targets'},
  containerImageTarget: {
    path: 'oci-image-target/:id',
    url: (id: string) => appendEncodedId('/oci-image-target', id),
  },
  webApplicationTargets: {
    path: 'web-application-targets',
    url: '/web-application-targets',
  },
  webApplicationTarget: {
    path: 'web-application-target/:id',
    url: (id: string) => appendEncodedId('/web-application-target', id),
  },
  cpes: {path: 'cpes', url: '/cpes'},
  cpe: {path: 'cpe/:id', url: (id: string) => appendEncodedId('/cpe', id)},
  credentials: {path: 'credentials', url: '/credentials'},
  credential: {
    path: 'credential/:id',
    url: (id: string) => appendEncodedId('/credential', id),
  },
  credentialStore: {path: 'credential-store', url: '/credential-store'},
  cves: {path: 'cves', url: '/cves'},
  cve: {path: 'cve/:id', url: (id: string) => appendEncodedId('/cve', id)},
  dfnCertAdvisories: {
    path: 'dfn-cert-advisories',
    url: '/dfn-cert-advisories',
  },
  dfnCertAdvisory: {
    path: 'dfn-cert-advisory/:id',
    url: (id: string) => appendEncodedId('/dfn-cert-advisory', id),
  },
  feedStatus: {path: 'feed-status', url: '/feed-status'},
  filters: {path: 'filters', url: '/filters'},
  filter: {
    path: 'filter/:id',
    url: (id: string) => appendEncodedId('/filter', id),
  },
  groups: {path: 'groups', url: '/groups'},
  group: {
    path: 'group/:id',
    url: (id: string) => appendEncodedId('/group', id),
  },
  hosts: {path: 'hosts', url: '/hosts'},
  host: {path: 'host/:id', url: (id: string) => appendEncodedId('/host', id)},
  ldap: {path: 'ldap', url: '/ldap'},
  notes: {path: 'notes', url: '/notes'},
  note: {path: 'note/:id', url: (id: string) => appendEncodedId('/note', id)},
  nvts: {path: 'nvts', url: '/nvts'},
  nvt: {path: 'nvt/:id', url: (id: string) => appendEncodedId('/nvt', id)},
  operatingSystems: {
    path: 'operating-systems',
    url: '/operating-systems',
  },
  operatingSystem: {
    path: 'operating-system/:id',
    url: (id: string) => appendEncodedId('/operating-system', id),
  },
  overrides: {path: 'overrides', url: '/overrides'},
  override: {
    path: 'override/:id',
    url: (id: string) => appendEncodedId('/override', id),
  },
  performance: {path: 'performance', url: '/performance'},
  permissions: {path: 'permissions', url: '/permissions'},
  permission: {
    path: 'permission/:id',
    url: (id: string) => appendEncodedId('/permission', id),
  },
  policies: {path: 'policies', url: '/policies'},
  policy: {
    path: 'policy/:id',
    url: (id: string) => appendEncodedId('/policy', id),
  },
  portLists: {path: 'port-lists', url: '/port-lists'},
  portList: {
    path: 'port-list/:id',
    url: (id: string) => appendEncodedId('/port-list', id),
  },
  portRange: {
    path: 'port-range/:id',
    url: (id: string) => appendEncodedId('/port-range', id),
  },
  radius: {path: 'radius', url: '/radius'},
  reports: {path: 'reports', url: '/reports'},
  report: {
    path: 'report/:id',
    url: (id: string) => appendEncodedId('/report', id),
  },
  reportConfigs: {path: 'report-configs', url: '/report-configs'},
  reportConfig: {
    path: 'report-config/:id',
    url: (id: string) => appendEncodedId('/report-config', id),
  },
  reportFormats: {path: 'report-formats', url: '/report-formats'},
  reportFormat: {
    path: 'report-format/:id',
    url: (id: string) => appendEncodedId('/report-format', id),
  },
  results: {path: 'results', url: '/results'},
  result: {
    path: 'result/:id',
    url: (id: string) => appendEncodedId('/result', id),
  },
  roles: {path: 'roles', url: '/roles'},
  role: {path: 'role/:id', url: (id: string) => appendEncodedId('/role', id)},
  scanConfigs: {path: 'scan-configs', url: '/scan-configs'},
  scanConfig: {
    path: 'scan-config/:id',
    url: (id: string) => appendEncodedId('/scan-config', id),
  },
  scanners: {path: 'scanners', url: '/scanners'},
  scanner: {
    path: 'scanner/:id',
    url: (id: string) => appendEncodedId('/scanner', id),
  },
  schedules: {path: 'schedules', url: '/schedules'},
  schedule: {
    path: 'schedule/:id',
    url: (id: string) => appendEncodedId('/schedule', id),
  },
  tags: {path: 'tags', url: '/tags'},
  tag: {path: 'tag/:id', url: (id: string) => appendEncodedId('/tag', id)},
  targets: {path: 'targets', url: '/targets'},
  target: {
    path: 'target/:id',
    url: (id: string) => appendEncodedId('/target', id),
  },
  tasks: {path: 'tasks', url: '/tasks'},
  task: {path: 'task/:id', url: (id: string) => appendEncodedId('/task', id)},
  tickets: {path: 'tickets', url: '/tickets'},
  ticket: {
    path: 'ticket/:id',
    url: (id: string) => appendEncodedId('/ticket', id),
  },
  tlsCertificates: {
    path: 'tls-certificates',
    url: '/tls-certificates',
  },
  tlsCertificate: {
    path: 'tls-certificate/:id',
    url: (id: string) => appendEncodedId('/tls-certificate', id),
  },
  trashcan: {path: 'trashcan', url: '/trashcan'},
  users: {path: 'users', url: '/users'},
  user: {path: 'user/:id', url: (id: string) => appendEncodedId('/user', id)},
  userSettings: {path: 'user-settings', url: '/user-settings'},
  vulnerabilities: {path: 'vulnerabilities', url: '/vulnerabilities'},
  vulnerability: {
    path: 'vulnerability/:id',
    url: (id: string) => appendEncodedId('/vulnerability', id),
  },
  asset: {
    path: 'asset/:id',
    url: (id: string) => appendEncodedId('/asset', id),
  },
  info: {path: 'info/:id', url: (id: string) => appendEncodedId('/info', id)},
  cvssCalculator: {path: 'cvss-calculator', url: '/cvss-calculator'},
  legacy: {
    auditReports: {path: 'auditreports', url: '/auditreports'},
    auditReport: {
      path: 'auditreport/:id',
      url: (id: string) => appendEncodedId('/auditreport', id),
    },
    certBundAdvisories: {path: 'certbunds', url: '/certbunds'},
    certBundAdvisory: {
      path: 'certbund/:id',
      url: (id: string) => appendEncodedId('/certbund', id),
    },
    ociImageTargets: {path: 'ociimagetargets', url: '/ociimagetargets'},
    webApplicationTargets: {
      path: 'webapplicationtargets',
      url: '/webapplicationtargets',
    },
    credentialStore: {path: 'credentialstore', url: '/credentialstore'},
    dfnCertAdvisories: {path: 'dfncerts', url: '/dfncerts'},
    dfnCertAdvisory: {
      path: 'dfncert/:id',
      url: (id: string) => appendEncodedId('/dfncert', id),
    },
    feedStatus: {path: 'feedstatus', url: '/feedstatus'},
    operatingSystems: {path: 'operatingsystems', url: '/operatingsystems'},
    operatingSystem: {
      path: 'operatingsystem/:id',
      url: (id: string) => appendEncodedId('/operatingsystem', id),
    },
    portLists: {path: 'portlists', url: '/portlists'},
    portList: {
      path: 'portlist/:id',
      url: (id: string) => appendEncodedId('/portlist', id),
    },
    reportConfigs: {path: 'reportconfigs', url: '/reportconfigs'},
    reportConfig: {
      path: 'reportconfig/:id',
      url: (id: string) => appendEncodedId('/reportconfig', id),
    },
    reportFormats: {path: 'reportformats', url: '/reportformats'},
    reportFormat: {
      path: 'reportformat/:id',
      url: (id: string) => appendEncodedId('/reportformat', id),
    },
    scanConfigs: {path: 'scanconfigs', url: '/scanconfigs'},
    scanConfig: {
      path: 'scanconfig/:id',
      url: (id: string) => appendEncodedId('/scanconfig', id),
    },
    tlsCertificates: {path: 'tlscertificates', url: '/tlscertificates'},
    tlsCertificate: {
      path: 'tlscertificate/:id',
      url: (id: string) => appendEncodedId('/tlscertificate', id),
    },
    userSettings: {path: 'usersettings', url: '/usersettings'},
    cvssCalculator: {path: 'cvsscalculator', url: '/cvsscalculator'},
    notFound: {path: 'notfound', url: '/notfound'},
  },
  notFound: {path: 'not-found', url: '/not-found'},
} as const;

export type RoutePaths = typeof ROUTES;

// API entity type names do not always match route keys or URL segments.
const entityRouteNames = {
  agent: 'agent',
  agentgroup: 'agentGroup',
  agentinstaller: 'agentInstaller',
  alert: 'alert',
  asset: 'asset',
  audit: 'audit',
  auditreport: 'auditReport',
  certbund: 'certBundAdvisory',
  cpe: 'cpe',
  credential: 'credential',
  cve: 'cve',
  dfncert: 'dfnCertAdvisory',
  filter: 'filter',
  group: 'group',
  host: 'host',
  info: 'info',
  ociimagetarget: 'containerImageTarget',
  operatingsystem: 'operatingSystem',
  webapplicationtarget: 'webApplicationTarget',
  override: 'override',
  note: 'note',
  nvt: 'nvt',
  permission: 'permission',
  policy: 'policy',
  portlist: 'portList',
  portrange: 'portRange',
  report: 'report',
  reportconfig: 'reportConfig',
  reportformat: 'reportFormat',
  result: 'result',
  role: 'role',
  scanconfig: 'scanConfig',
  scanner: 'scanner',
  schedule: 'schedule',
  tag: 'tag',
  target: 'target',
  task: 'task',
  ticket: 'ticket',
  tlscertificate: 'tlsCertificate',
  user: 'user',
  vulnerability: 'vulnerability',
} as const satisfies Record<EntityType, keyof RoutePaths>;

export const entityURL = (type: EntityType, id: string): string => {
  const route = ROUTES[entityRouteNames[type]];
  return typeof route.url === 'function' ? route.url(id) : route.url;
};

const entityListRouteNames = {
  agent: 'agents',
  agentgroup: 'agentGroups',
  agentinstaller: 'agentInstallers',
  alert: 'alerts',
  audit: 'audits',
  auditreport: 'auditReports',
  certbund: 'certBundAdvisories',
  cpe: 'cpes',
  credential: 'credentials',
  cve: 'cves',
  dfncert: 'dfnCertAdvisories',
  filter: 'filters',
  group: 'groups',
  host: 'hosts',
  ociimagetarget: 'ociImageTargets',
  operatingsystem: 'operatingSystems',
  webapplicationtarget: 'webApplicationTargets',
  override: 'overrides',
  note: 'notes',
  nvt: 'nvts',
  permission: 'permissions',
  policy: 'policies',
  portlist: 'portLists',
  report: 'reports',
  reportconfig: 'reportConfigs',
  reportformat: 'reportFormats',
  result: 'results',
  role: 'roles',
  scanconfig: 'scanConfigs',
  scanner: 'scanners',
  schedule: 'schedules',
  tag: 'tags',
  target: 'targets',
  task: 'tasks',
  ticket: 'tickets',
  tlscertificate: 'tlsCertificates',
  user: 'users',
  vulnerability: 'vulnerabilities',
} as const satisfies Partial<Record<EntityType, keyof RoutePaths>>;

export type EntityListType = keyof typeof entityListRouteNames;

export const entityListURL = (type: EntityListType): string =>
  ROUTES[entityListRouteNames[type]].url;
