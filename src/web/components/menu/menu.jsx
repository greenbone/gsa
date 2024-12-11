/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import {AppNavigation} from '@greenbone/opensight-ui-components-mantinev7';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import {useMatch} from 'react-router-dom';

import Link from 'web/components/link/link';
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
import {isDefined} from 'gmp/utils/identity';

const Menu = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const gmp = useGmp();

  function checkCapabilities(capabilitiesList) {
    return capabilitiesList.reduce(
      (sum, cur) => sum || capabilities.mayAccess(cur),
      false,
    );
  }

  const mayOpScans = checkCapabilities([
    'tasks',
    'reports',
    'results',
    'vulns',
    'overrides',
    'notes',
  ]);

  const mayOpConfiguration = checkCapabilities([
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

  const mayOpResilience = checkCapabilities(['tickets', 'policies', 'audits']);

  const mayOpAssets = checkCapabilities(['assets', 'tls_certificates']);

  const useIsActive = path => Boolean(useMatch(path));

  const isUserActive = useIsActive('/users');
  const isGroupsActive = useIsActive('/groups');
  const isRolesActive = useIsActive('/roles');
  const isPermissionsActive = useIsActive('/permissions');
  const isPerformanceActive = useIsActive('/performance');
  const isTrashcanActive = useIsActive('/trashcan');
  const isFeedStatusActive = useIsActive('/feedstatus');
  const isLdapActive = useIsActive('/ldap');
  const isRadiusActive = useIsActive('/radius');

  const isCvssCalculatorActive = useIsActive('/cvsscalculator');
  const isAboutActive = useIsActive('/about');

  const subNavConfigs = {
    scans: [
      {
        label: 'Tasks',
        to: '/tasks',
        activeCondition: useIsActive('/tasks'),
        'data-testid': 'menu-tasks',
      },
      {
        label: 'Reports',
        to: '/reports',
        activeCondition: useIsActive('/reports'),
        'data-testid': 'menu-reports',
      },
      {
        label: 'Results',
        to: '/results',
        activeCondition: useIsActive('/results'),
        'data-testid': 'menu-results',
      },
      {
        label: 'Vulnerabilities',
        to: '/vulnerabilities',
        activeCondition: useIsActive('/vulnerabilities'),
        'data-testid': 'menu-vulnerabilities',
      },
      {
        label: 'Notes',
        to: '/notes',
        activeCondition: useIsActive('/notes'),
        'data-testid': 'menu-notes',
      },
      {
        label: 'Overrides',
        to: '/overrides',
        activeCondition: useIsActive('/overrides'),
        'data-testid': 'menu-overrides',
      },
    ],
    assets: [
      {
        label: 'Hosts',
        to: '/hosts',
        activeCondition: useIsActive('/hosts'),
        'data-testid': 'menu-hosts',
      },
      {
        label: 'Operating Systems',
        to: '/operatingsystems',
        activeCondition: useIsActive('/operatingsystems'),
        'data-testid': 'menu-operating-systems',
      },
      {
        label: 'TLS Certificates',
        to: '/tlscertificates',
        activeCondition: useIsActive('/tlscertificates'),
        'data-testid': 'menu-tls-certificates',
      },
    ],
    resilience: [
      {
        label: 'Remediation Tickets',
        to: '/tickets',
        activeCondition: useIsActive('/tickets'),
        'data-testid': 'menu-remediation-tickets',
      },
      {
        label: 'Compliance Policies',
        to: '/policies',
        activeCondition: useIsActive('/policies'),
        'data-testid': 'menu-policies',
      },
      {
        label: 'Compliance Audits',
        to: '/audits',
        activeCondition: useIsActive('/audits'),
        'data-testid': 'menu-audits',
      },
      {
        label: 'Compliance Audit Reports',
        to: '/auditreports',
        activeCondition: useIsActive('/auditreports'),
        'data-testid': 'menu-audit-reports',
      },
    ],
    secInfo: [
      {
        label: 'NVTs',
        to: '/nvts',
        activeCondition: useIsActive('/nvts'),
        'data-testid': 'menu-nvts',
      },
      {
        label: 'CVEs',
        to: '/cves',
        activeCondition: useIsActive('/cves'),
        'data-testid': 'menu-cves',
      },
      {
        label: 'CPEs',
        to: '/cpes',
        activeCondition: useIsActive('/cpes'),
        'data-testid': 'menu-cpes',
      },
      {
        label: 'CERT-Bund Advisories',
        to: '/certbunds',
        activeCondition: useIsActive('/certbunds'),
        'data-testid': 'menu-certbunds',
      },
      {
        label: 'DFN-CERT Advisories',
        to: '/dfncerts',
        activeCondition: useIsActive('/dfncerts'),
        'data-testid': 'menu-dfncerts',
      },
    ],
    configuration: [
      {
        label: 'Targets',
        to: '/targets',
        activeCondition: useIsActive('/targets'),
        'data-testid': 'menu-targets',
      },
      {
        label: 'Port Lists',
        to: '/portlists',
        activeCondition: useIsActive('/portlists'),
        'data-testid': 'menu-portlists',
      },
      {
        label: 'Credentials',
        to: '/credentials',
        activeCondition: useIsActive('/credentials'),
        'data-testid': 'menu-credentials',
      },
      {
        label: 'Scan Configs',
        to: '/scanconfigs',
        activeCondition: useIsActive('/scanconfigs'),
        'data-testid': 'menu-scanconfigs',
      },
      {
        label: 'Alerts',
        to: '/alerts',
        activeCondition: useIsActive('/alerts'),
        'data-testid': 'menu-alerts',
      },
      {
        label: 'Schedules',
        to: '/schedules',
        activeCondition: useIsActive('/schedules'),
        'data-testid': 'menu-schedules',
      },
      {
        label: 'Report Configs',
        to: '/reportconfigs',
        activeCondition: useIsActive('/reportconfigs'),
        'data-testid': 'menu-report-configs',
      },
      {
        label: 'Report Formats',
        to: '/reportformats',
        activeCondition: useIsActive('/reportformats'),
        'data-testid': 'menu-report-formats',
      },
      {
        label: 'Scanners',
        to: '/scanners',
        activeCondition: useIsActive('/scanners'),
        'data-testid': 'menu-scanners',
      },
      {
        label: 'Filters',
        to: '/filters',
        activeCondition: useIsActive('/filters'),
        'data-testid': 'menu-filters',
      },
      {
        label: 'Tags',
        to: '/tags',
        activeCondition: useIsActive('/tags'),
        'data-testid': 'menu-tags',
      },
    ],
  };

  const createMenuItemWithSubNav = (label, key, icon, config) => ({
    label: _(label),
    key: key,
    icon: icon,
    subNav: config
      .map(({label, to, activeCondition, featureEnabled}) => ({
        label: _(label),
        to: to,
        active: activeCondition,
        visible:
          !isDefined(featureEnabled) ||
          capabilities.featureEnabled(featureEnabled),
      }))
      .filter(({visible}) => visible !== false),
      ...additionalProps,
  });

  const menuPoints = [
    [
      {
        label: _('Dashboards'),
        to: '/dashboards',
        icon: BarChart3,
        'data-testid' : 'menu-dashboards',
      },
    ],
    [
      mayOpScans &&
        createMenuItemWithSubNav(
          'Scans',
          'scans',
          ShieldCheck,
          subNavConfigs.scans,
          {
            'data-testid': 'menu-scans',
          }
        ),
      mayOpAssets &&
        createMenuItemWithSubNav(
          'Assets',
          'assets',
          Server,
          subNavConfigs.assets,
          {
            'data-testid': 'menu-assets',
          }
        ),
      mayOpResilience &&
        createMenuItemWithSubNav(
          'Resilience',
          'resilience',
          FileCheck,
          subNavConfigs.resilience,
          {
            'data-testid': 'menu-resilience',
          }
        ),
      capabilities.mayAccess('info') &&
        createMenuItemWithSubNav(
          'Security Information',
          'secInfo',
          View,
          subNavConfigs.secInfo,
          {
            'data-testid': 'menu-secinfo',
          }
        ),
      mayOpConfiguration &&
        createMenuItemWithSubNav(
          'Configuration',
          'configuration',
          Wrench,
          subNavConfigs.configuration,
          {
            'data-testid': 'menu-configuration',
          }
        ),
      {
        label: _('Administration'),
        key: 'administration',
        icon: SlidersHorizontal,
        'data-testid' : 'menu-administration',
        subNav: [
          capabilities.mayAccess('users') && {
            label: _('Users'),
            to: '/users',
            active: isUserActive,
            'data-testid': 'menu-users',
          },
          capabilities.mayAccess('groups') && {
            label: _('Groups'),
            to: '/groups',
            active: isGroupsActive,
            'data-testid': 'menu-groups',
          },
          capabilities.mayAccess('roles') && {
            label: _('Roles'),
            to: '/roles',
            active: isRolesActive,
            'data-testid': 'menu-roles',
          },
          capabilities.mayAccess('permissions') && {
            label: _('Permissions'),
            to: '/permissions',
            active: isPermissionsActive,
            'data-testid': 'menu-permissions',
          },
          capabilities.mayAccess('system_reports') && {
            label: _('Performance'),
            to: '/performance',
            active: isPerformanceActive,
            'data-testid': 'menu-performance',
          },
          {
            label: _('Trashcan'),
            to: '/trashcan',
            active: isTrashcanActive,
            'data-testid': 'menu-trashcan',
          },
          capabilities.mayAccess('feeds') && {
            label: _('Feed Status'),
            to: '/feedstatus',
            active: isFeedStatusActive,
            'data-testid': 'menu-feed-status',
          },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('LDAP'),
              to: '/ldap',
              active: isLdapActive,
              'data-testid': 'menu-ldap',
            },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('RADIUS'),
              to: '/radius',
              active: isRadiusActive,
              'data-testid': 'menu-radius',
            },
        ].filter(Boolean),
      },
      {
        label: _('Help'),
        key: 'help',
        icon: CircleHelp,
        'data-testid' : 'menu-help',
        subNav: [
          {
            label: _('User Manual'),
            to: 'https://docs.greenbone.net/GSM-Manual/gos-22.04/en/',
            isExternal: true,
            'data-testid': 'menu-user-manual',
          },
          {
            label: _('CVSS Calculator'),
            to: '/cvsscalculator',
            active: isCvssCalculatorActive,
            'data-testid': 'menu-cvss-calc',
          },
          {
            label: _('About'),
            to: '/about',
            active: isAboutActive,
            'data-testid': 'menu-about',
          },
        ],
      },
    ].filter(Boolean),
    [
      gmp.settings.enableAssetManagement && {
        label: _('Asset'),
        to: '/asset-management',
        isExternal: true,
        'data-testid' : 'menu-asset-management',
      },
    ].filter(Boolean),
  ];
  return <AppNavigation menuPoints={menuPoints} as={Link} />;
};

export default Menu;
