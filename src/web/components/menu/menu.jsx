/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {AppNavigation} from '@greenbone/opensight-ui-components-mantinev7';
import {isDefined} from 'gmp/utils/identity';
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
import React from 'react';
import {useMatch} from 'react-router-dom';
import Link from 'web/components/link/link';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

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
      },
      {
        label: 'Reports',
        to: '/reports',
        activeCondition: useIsActive('/reports'),
      },
      {
        label: 'Results',
        to: '/results',
        activeCondition: useIsActive('/results'),
      },
      {
        label: 'Vulnerabilities',
        to: '/vulnerabilities',
        activeCondition: useIsActive('/vulnerabilities'),
      },
      {
        label: 'Notes',
        to: '/notes',
        activeCondition: useIsActive('/notes'),
      },
      {
        label: 'Overrides',
        to: '/overrides',
        activeCondition: useIsActive('/overrides'),
      },
    ],
    assets: [
      {
        label: 'Hosts',
        to: '/hosts',
        activeCondition: useIsActive('/hosts'),
      },
      {
        label: 'Operating Systems',
        to: '/operatingsystems',
        activeCondition: useIsActive('/operatingsystems'),
      },
      {
        label: 'TLS Certificates',
        to: '/tlscertificates',
        activeCondition: useIsActive('/tlscertificates'),
      },
    ],
    resilience: [
      {
        label: 'Remediation Tickets',
        to: '/tickets',
        activeCondition: useIsActive('/tickets'),
      },
      {
        label: 'Compliance Policies',
        to: '/policies',
        activeCondition: useIsActive('/policies'),
      },
      {
        label: 'Compliance Audits',
        to: '/audits',
        activeCondition: useIsActive('/audits'),
      },
      {
        label: 'Compliance Audit Reports',
        to: '/auditreports',
        activeCondition: useIsActive('/auditreports'),
      },
    ],
    secInfo: [
      {
        label: 'NVTs',
        to: '/nvts',
        activeCondition: useIsActive('/nvts'),
      },
      {
        label: 'CVEs',
        to: '/cves',
        activeCondition: useIsActive('/cves'),
      },
      {
        label: 'CPEs',
        to: '/cpes',
        activeCondition: useIsActive('/cpes'),
      },
      {
        label: 'CERT-Bund Advisories',
        to: '/certbunds',
        activeCondition: useIsActive('/certbunds'),
      },
      {
        label: 'DFN-CERT Advisories',
        to: '/dfncerts',
        activeCondition: useIsActive('/dfncerts'),
      },
    ],
    configuration: [
      {
        label: 'Targets',
        to: '/targets',
        activeCondition: useIsActive('/targets'),
      },
      {
        label: 'Port Lists',
        to: '/portlists',
        activeCondition: useIsActive('/portlists'),
      },
      {
        label: 'Credentials',
        to: '/credentials',
        activeCondition: useIsActive('/credentials'),
      },
      {
        label: 'Scan Configs',
        to: '/scanconfigs',
        activeCondition: useIsActive('/scanconfigs'),
      },
      {
        label: 'Alerts',
        to: '/alerts',
        activeCondition: useIsActive('/alerts'),
      },
      {
        label: 'Schedules',
        to: '/schedules',
        activeCondition: useIsActive('/schedules'),
      },
      {
        label: 'Report Configs',
        to: '/reportconfigs',
        activeCondition: useIsActive('/reportconfigs'),
      },
      {
        label: 'Report Formats',
        to: '/reportformats',
        activeCondition: useIsActive('/reportformats'),
      },
      {
        label: 'Scanners',
        to: '/scanners',
        activeCondition: useIsActive('/scanners'),
      },
      {
        label: 'Filters',
        to: '/filters',
        activeCondition: useIsActive('/filters'),
      },
      {
        label: 'Tags',
        to: '/tags',
        activeCondition: useIsActive('/tags'),
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
  });

  const menuPoints = [
    [
      {
        label: _('Dashboards'),
        to: '/dashboards',
        icon: BarChart3,
      },
    ],
    [
      mayOpScans &&
        createMenuItemWithSubNav(
          'Scans',
          'scans',
          ShieldCheck,
          subNavConfigs.scans,
        ),
      mayOpAssets &&
        createMenuItemWithSubNav(
          'Assets',
          'assets',
          Server,
          subNavConfigs.assets,
        ),
      mayOpResilience &&
        createMenuItemWithSubNav(
          'Resilience',
          'resilience',
          FileCheck,
          subNavConfigs.resilience,
        ),
      capabilities.mayAccess('info') &&
        createMenuItemWithSubNav(
          'Security Information',
          'secInfo',
          View,
          subNavConfigs.secInfo,
        ),
      mayOpConfiguration &&
        createMenuItemWithSubNav(
          'Configuration',
          'configuration',
          Wrench,
          subNavConfigs.configuration,
        ),
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
            label: _('User Manual'),
            to: 'https://docs.greenbone.net/GSM-Manual/gos-22.04/en/',
            isExternal: true,
          },
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
