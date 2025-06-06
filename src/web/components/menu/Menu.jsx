/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {AppNavigation} from '@greenbone/opensight-ui-components-mantinev7';
import {
  BarChart3,
  Server,
  ShieldCheck,
  View,
  Wrench,
  SlidersHorizontal,
  FileCheck,
  CircleHelp,
} from 'lucide-react';
import {useMatch} from 'react-router';
import Link from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

const Menu = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const gmp = useGmp();

  const isTasksActive = Boolean(useMatch('/tasks'));
  const isReportsActive = Boolean(useMatch('/reports'));
  const isResultsActive = Boolean(useMatch('/results'));
  const isVulnerabilitiesActive = Boolean(useMatch('/vulnerabilities'));
  const isNotesActive = Boolean(useMatch('/notes'));
  const isOverridesActive = Boolean(useMatch('/overrides'));
  const isHostsActive = Boolean(useMatch('/hosts'));
  const isOperatingSystemsActive = Boolean(useMatch('/operatingsystems'));
  const isTlsCertificatesActive = Boolean(useMatch('/tlscertificates'));
  const isTicketsActive = Boolean(useMatch('/tickets'));
  const isPoliciesActive = Boolean(useMatch('/policies'));
  const isAuditsActive = Boolean(useMatch('/audits'));
  const isAuditReportsActive = Boolean(useMatch('/auditreports'));
  const isNvtsActive = Boolean(useMatch('/nvts'));
  const isCvesActive = Boolean(useMatch('/cves'));
  const isCpesActive = Boolean(useMatch('/cpes'));
  const isCertbundsActive = Boolean(useMatch('/certbunds'));
  const isDfncertsActive = Boolean(useMatch('/dfncerts'));
  const isTargetsActive = Boolean(useMatch('/targets'));
  const isPortlistsActive = Boolean(useMatch('/portlists'));
  const isCredentialsActive = Boolean(useMatch('/credentials'));
  const isScanConfigsActive = Boolean(useMatch('/scanconfigs'));
  const isAlertsActive = Boolean(useMatch('/alerts'));
  const isSchedulesActive = Boolean(useMatch('/schedules'));
  const isReportConfigsActive = Boolean(useMatch('/reportconfigs'));
  const isReportFormatsActive = Boolean(useMatch('/reportformats'));
  const isScannersActive = Boolean(useMatch('/scanners'));
  const isFiltersActive = Boolean(useMatch('/filters'));
  const isTagsActive = Boolean(useMatch('/tags'));
  const isUserActive = Boolean(useMatch('/users'));
  const isGroupsActive = Boolean(useMatch('/groups'));
  const isRolesActive = Boolean(useMatch('/roles'));
  const isPermissionsActive = Boolean(useMatch('/permissions'));
  const isPerformanceActive = Boolean(useMatch('/performance'));
  const isTrashcanActive = Boolean(useMatch('/trashcan'));
  const isFeedStatusActive = Boolean(useMatch('/feedstatus'));
  const isLdapActive = Boolean(useMatch('/ldap'));
  const isRadiusActive = Boolean(useMatch('/radius'));
  const isCvssCalculatorActive = Boolean(useMatch('/cvsscalculator'));
  const isAboutActive = Boolean(useMatch('/about'));

  const mayAccessAny = keys => keys.some(key => capabilities.mayAccess(key));

  const mayOpScans = mayAccessAny([
    'tasks',
    'reports',
    'results',
    'vulns',
    'overrides',
    'notes',
  ]);
  const mayOpConfiguration = mayAccessAny([
    'targets',
    'port_lists',
    'credentials',
    'scan_configs',
    'alerts',
    'schedules',
    'report_configs',
    'report_formats',
    'scanners',
    'filters',
    'tags',
  ]);
  const mayOpResilience = mayAccessAny([
    'tickets',
    'policies',
    'audits',
    'auditreports',
  ]);
  const mayOpAssets = mayAccessAny(['assets', 'tls_certificates']);

  const menuPoints = [
    [
      {
        icon: BarChart3,
        label: _('Dashboards'),
        to: '/dashboards',
        key: 'dashboards',
      },
    ],
    [
      mayOpScans && {
        icon: ShieldCheck,
        label: _('Scans'),
        key: 'scans',
        subNav: [
          capabilities.mayAccess('tasks') && {
            label: _('Tasks'),
            to: '/tasks',
            active: isTasksActive,
          },
          capabilities.mayAccess('reports') && {
            label: _('Reports'),
            to: '/reports',
            active: isReportsActive,
          },
          capabilities.mayAccess('results') && {
            label: _('Results'),
            to: '/results',
            active: isResultsActive,
          },
          capabilities.mayAccess('vulns') && {
            label: _('Vulnerabilities'),
            to: '/vulnerabilities',
            active: isVulnerabilitiesActive,
          },
          capabilities.mayAccess('notes') && {
            label: _('Notes'),
            to: '/notes',
            active: isNotesActive,
          },
          capabilities.mayAccess('overrides') && {
            label: _('Overrides'),
            to: '/overrides',
            active: isOverridesActive,
          },
        ].filter(Boolean),
      },
      mayOpAssets && {
        icon: Server,
        label: _('Assets'),
        key: 'assets',
        subNav: [
          capabilities.mayAccess('assets') && {
            label: _('Hosts'),
            to: '/hosts',
            active: isHostsActive,
          },
          capabilities.mayAccess('assets') && {
            label: _('Operating Systems'),
            to: '/operatingsystems',
            active: isOperatingSystemsActive,
          },
          capabilities.mayAccess('tls_certificates') && {
            label: _('TLS Certificates'),
            to: '/tlscertificates',
            active: isTlsCertificatesActive,
          },
        ].filter(Boolean),
      },
      mayOpResilience && {
        icon: FileCheck,
        label: _('Resilience'),
        key: 'resilience',
        subNav: [
          capabilities.mayAccess('tickets') && {
            label: _('Remediation Tickets'),
            to: '/tickets',
            active: isTicketsActive,
          },
          capabilities.mayAccess('policies') && {
            label: _('Compliance Policies'),
            to: '/policies',
            active: isPoliciesActive,
          },
          capabilities.mayAccess('audits') && {
            label: _('Compliance Audits'),
            to: '/audits',
            active: isAuditsActive,
          },
          capabilities.mayAccess('auditreports') && {
            label: _('Compliance Audit Reports'),
            to: '/auditreports',
            active: isAuditReportsActive,
          },
        ].filter(Boolean),
      },
      capabilities.mayAccess('info') && {
        icon: View,
        label: _('Security Information'),
        key: 'secInfo',
        subNav: [
          {
            label: _('NVTs'),
            to: '/nvts',
            active: isNvtsActive,
          },
          {
            label: _('CVEs'),
            to: '/cves',
            active: isCvesActive,
          },
          {
            label: _('CPEs'),
            to: '/cpes',
            active: isCpesActive,
          },
          {
            label: _('CERT-Bund Advisories'),
            to: '/certbunds',
            active: isCertbundsActive,
          },
          {
            label: _('DFN-CERT Advisories'),
            to: '/dfncerts',
            active: isDfncertsActive,
          },
        ],
      },
      mayOpConfiguration && {
        icon: Wrench,
        label: _('Configuration'),
        key: 'configuration',
        subNav: [
          capabilities.mayAccess('targets') && {
            label: _('Targets'),
            to: '/targets',
            active: isTargetsActive,
          },
          capabilities.mayAccess('port_lists') && {
            label: _('Port Lists'),
            to: '/portlists',
            active: isPortlistsActive,
          },
          capabilities.mayAccess('credentials') && {
            label: _('Credentials'),
            to: '/credentials',
            active: isCredentialsActive,
          },
          capabilities.mayAccess('scan_configs') && {
            label: _('Scan Configs'),
            to: '/scanconfigs',
            active: isScanConfigsActive,
          },
          capabilities.mayAccess('alerts') && {
            label: _('Alerts'),
            to: '/alerts',
            active: isAlertsActive,
          },
          capabilities.mayAccess('schedules') && {
            label: _('Schedules'),
            to: '/schedules',
            active: isSchedulesActive,
          },
          capabilities.mayAccess('report_configs') && {
            label: _('Report Configs'),
            to: '/reportconfigs',
            active: isReportConfigsActive,
          },
          capabilities.mayAccess('report_formats') && {
            label: _('Report Formats'),
            to: '/reportformats',
            active: isReportFormatsActive,
          },
          capabilities.mayAccess('scanners') && {
            label: _('Scanners'),
            to: '/scanners',
            active: isScannersActive,
          },
          capabilities.mayAccess('filters') && {
            label: _('Filters'),
            to: '/filters',
            active: isFiltersActive,
          },
          capabilities.mayAccess('tags') && {
            label: _('Tags'),
            to: '/tags',
            active: isTagsActive,
          },
        ].filter(Boolean),
      },
      {
        label: _('Administration'),
        key: 'administration',
        icon: SlidersHorizontal,
        subNav: [
          capabilities.mayAccess('users') && {
            label: _('Users'),
            to: '/users',
            active: isUserActive,
          },
          capabilities.mayAccess('groups') && {
            label: _('Groups'),
            to: '/groups',
            active: isGroupsActive,
          },
          capabilities.mayAccess('roles') && {
            label: _('Roles'),
            to: '/roles',
            active: isRolesActive,
          },
          capabilities.mayAccess('permissions') && {
            label: _('Permissions'),
            to: '/permissions',
            active: isPermissionsActive,
          },
          capabilities.mayAccess('system_reports') && {
            label: _('Performance'),
            to: '/performance',
            active: isPerformanceActive,
          },
          {
            label: _('Trashcan'),
            to: '/trashcan',
            active: isTrashcanActive,
          },
          capabilities.mayAccess('feeds') && {
            label: _('Feed Status'),
            to: '/feedstatus',
            active: isFeedStatusActive,
          },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('LDAP'),
              to: '/ldap',
              active: isLdapActive,
            },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('RADIUS'),
              to: '/radius',
              active: isRadiusActive,
            },
        ].filter(Boolean),
      },
      {
        label: _('Help'),
        key: 'help',
        icon: CircleHelp,
        subNav: [
          {
            label: _('CVSS Calculator'),
            to: '/cvsscalculator',
            active: isCvssCalculatorActive,
          },
          {
            label: _('About'),
            to: '/about',
            active: isAboutActive,
          },
        ],
      },
    ].filter(Boolean),
    [
      gmp.settings.enableAssetManagement && {
        label: _('Asset'),
        to: '/asset-management',
        isExternal: true,
      },
    ].filter(Boolean),
  ];
  return <AppNavigation as={Link} menuPoints={menuPoints} />;
};

export default Menu;
