/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import {AppNavigation} from '@greenbone/opensight-ui-components';

import useTranslation from 'web/hooks/useTranslation';
import useCapabilities from 'web/utils/useCapabilities';

import TaskIcon from 'web/components/icon/taskicon';
import Link from 'web/components/link/link';
import ReportIcon from 'web/components/icon/reporticon';
import ResultIcon from 'web/components/icon/resulticon';
import VulnerabilityIcon from 'web/components/icon/vulnerabilityicon';
import NoteIcon from 'web/components/icon/noteicon';
import OverrideIcon from 'web/components/icon/overrideicon';
import HostIcon from 'web/components/icon/hosticon';
import OperatingSystemIcon from 'web/components/icon/ossvgicon';
import TlsCertificateIcon from 'web/components/icon/tlscertificateicon';
import TicketIcon from 'web/components/icon/ticketicon';
import PolicyIcon from 'web/components/icon/policyicon';
import AuditIcon from 'web/components/icon/auditicon';
import NvtIcon from 'web/components/icon/nvticon';
import CveIcon from 'web/components/icon/cveicon';
import CpeIcon from 'web/components/icon/cpeicon';
import CertBundAdvIcon from 'web/components/icon/certbundadvicon';
import DfnCertAdvIcon from 'web/components/icon/dfncertadvicon';
import TargetIcon from 'web/components/icon/targeticon';
import PortListIcon from 'web/components/icon/portlisticon';
import CvssIcon from 'web/components/icon/cvssicon';
import CredentialIcon from 'web/components/icon/credentialicon';
import ScanConfigIcon from 'web/components/icon/scanconfigicon';
import AlertIcon from 'web/components/icon/alerticon';
import ScheduleIcon from 'web/components/icon/scheduleicon';
import ReportFormatIcon from 'web/components/icon/reportformaticon';
import ScannerIcon from 'web/components/icon/scannericon';
import FilterIcon from 'web/components/icon/filtericon';
import TagsSvgIcon from 'web/components/icon/tagssvgicon';
import UserIcon from 'web/components/icon/usericon';
import GroupIcon from 'web/components/icon/groupicon';
import RoleIcon from 'web/components/icon/roleicon';
import PermissionIcon from 'web/components/icon/permissionicon';
import PerformanceIcon from 'web/components/icon/performanceicon';
import TrashcanIcon from 'web/components/icon/trashcanicon';
import FeedIcon from 'web/components/icon/feedicon';
import LdapIcon from 'web/components/icon/ldapicon';
import RadiusIcon from 'web/components/icon/radiusicon';

const Menu = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();

  const mayOpScans = [
    'tasks',
    'reports',
    'results',
    'vulns',
    'overrides',
    'notes',
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false);
  const mayOpConfiguration = [
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
  ].reduce((sum, cur) => sum || capabilities.mayAccess(cur), false);
  const mayOpResilience = ['tickets', 'policies', 'audits'].reduce(
    (sum, cur) => sum || capabilities.mayAccess(cur),
    false,
  );
  const mayOpAssets = ['assets', 'tls_certificates'].reduce(
    (sum, cur) => sum || capabilities.mayAccess(cur),
    false,
  );

  const menuPoints = [
    [
      {
        icon: () => {},
        label: _('Dashboards'),
        to: '/',
        active: false,
        defaultOpened: false,
        isExternal: false,
      },
    ],
    [
      mayOpScans && {
        icon: () => {},
        label: _('Scans'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          capabilities.mayAccess('tasks') && {
            icon: TaskIcon,
            label: _('Tasks'),
            to: '/tasks',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('reports') && {
            icon: ReportIcon,
            label: _('Reports'),
            to: '/reports',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('results') && {
            icon: ResultIcon,
            label: _('Results'),
            to: '/results',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('vulns') && {
            icon: VulnerabilityIcon,
            label: _('Vulnerabilities'),
            to: '/vulnerabilities',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('notes') && {
            icon: NoteIcon,
            label: _('Notes'),
            to: '/notes',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('overrides') && {
            icon: OverrideIcon,
            label: _('Overrides'),
            to: '/overrides',
            active: false,
            isExternal: false,
          },
        ].filter(Boolean),
      },
      mayOpAssets && {
        icon: () => {},
        label: _('Assets'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          capabilities.mayAccess('assets') && {
            icon: HostIcon,
            label: _('Hosts'),
            to: '/hosts',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('assets') && {
            icon: OperatingSystemIcon,
            label: _('Operating Systems'),
            to: '/operatingsystems',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('tls_certificates') && {
            icon: TlsCertificateIcon,
            label: _('TLS Certificates'),
            to: '/tlscertificates',
            active: false,
            isExternal: false,
          },
        ].filter(Boolean),
      },
      mayOpResilience && {
        icon: () => {},
        label: _('Resilience'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          capabilities.mayAccess('tickets') && {
            icon: TicketIcon,
            label: _('Remediation Tickets'),
            to: '/tickets',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('policies') && {
            icon: PolicyIcon,
            label: _('Compliance Policies'),
            to: '/policies',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('audits') && {
            icon: AuditIcon,
            label: _('Compliance Audits'),
            to: '/audits',
            active: false,
            isExternal: false,
          },
        ].filter(Boolean),
      },
      capabilities.mayAccess('info') && {
        icon: () => {},
        label: _('SecInfo'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          {
            icon: NvtIcon,
            label: _('NVTs'),
            to: '/nvts',
            active: false,
            isExternal: false,
          },
          {
            icon: CveIcon,
            label: _('CVEs'),
            to: '/cves',
            active: false,
            isExternal: false,
          },
          {
            icon: CpeIcon,
            label: _('CPEs'),
            to: '/cpes',
            active: false,
            isExternal: false,
          },
          {
            icon: CertBundAdvIcon,
            label: _('CERT-Bund Advisories'),
            to: '/certbunds',
            active: false,
            isExternal: false,
          },
          {
            icon: DfnCertAdvIcon,
            label: _('DFN-CERT Advisories'),
            to: '/dfncerts',
            active: false,
            isExternal: false,
          },
        ],
      },
      mayOpConfiguration && {
        icon: () => {},
        label: _('Configuration'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          capabilities.mayAccess('targets') && {
            icon: TargetIcon,
            label: _('Targets'),
            to: '/targets',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('port_lists') && {
            icon: PortListIcon,
            label: _('Port Lists'),
            to: '/portlists',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('credentials') && {
            icon: CredentialIcon,
            label: _('Credentials'),
            to: '/credentials',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('configs') && {
            icon: ScanConfigIcon,
            label: _('Scan Configs'),
            to: '/scanconfigs',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('alerts') && {
            icon: AlertIcon,
            label: _('Alerts'),
            to: '/alerts',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('schedules') && {
            icon: ScheduleIcon,
            label: _('Schedules'),
            to: '/schedules',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('report_configs') && {
            icon: ReportFormatIcon,
            label: _('Report Configs'),
            to: '/reportconfigs',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('report_formats') && {
            icon: ReportFormatIcon,
            label: _('Report Formats'),
            to: '/reportformats',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('scanners') && {
            icon: ScannerIcon,
            label: _('Scanners'),
            to: '/scanners',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('filters') && {
            icon: FilterIcon,
            label: _('Filters'),
            to: '/filters',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('tags') && {
            icon: TagsSvgIcon,
            label: _('Tags'),
            to: '/tags',
            active: false,
            isExternal: false,
          },
        ].filter(Boolean),
      },
      {
        icon: () => {},
        label: _('Administration'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          capabilities.mayAccess('users') && {
            icon: UserIcon,
            label: _('Users'),
            to: '/users',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('groups') && {
            icon: GroupIcon,
            label: _('Groups'),
            to: '/groups',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('roles') && {
            icon: RoleIcon,
            label: _('Roles'),
            to: '/roles',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('permissions') && {
            icon: PermissionIcon,
            label: _('Permissions'),
            to: '/permissions',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('system_reports') && {
            icon: PerformanceIcon,
            label: _('Performance'),
            to: '/performance',
            active: false,
            isExternal: false,
          },
          {
            icon: TrashcanIcon,
            label: _('Trashcan'),
            to: '/trashcan',
            active: false,
            isExternal: false,
          },
          capabilities.mayAccess('feeds') && {
            icon: FeedIcon,
            label: _('Feed Status'),
            to: '/feedstatus',
            active: false,
            isExternal: false,
          },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              icon: LdapIcon,
              label: _('LDAP'),
              to: '/ldap',
              active: false,
              isExternal: false,
            },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              icon: RadiusIcon,
              label: _('RADIUS'),
              to: '/radius',
              active: false,
              isExternal: false,
            },
        ].filter(Boolean),
      },
      {
        icon: () => {},
        label: _('Help'),
        active: false,
        defaultOpened: false,
        isExternal: false,
        subNav: [
          {
            label: _('User Manual'),
            to: 'https://docs.greenbone.net/GSM-Manual/gos-22.04/en/',
            active: false,
            isExternal: true,
          },
          {
            icon: CvssIcon,
            label: _('CVSS Calculator'),
            to: '/cvsscalculator',
            active: false,
            isExternal: false,
          },
          {
            label: _('About'),
            to: '/about',
            active: false,
            isExternal: false,
          },
        ],
      },
    ].filter(Boolean),
  ];
  return <AppNavigation menuPoints={menuPoints} as={Link} />;
};

export default Menu;
