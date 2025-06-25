/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

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
import {isDefined} from 'gmp/utils/identity';
import Link from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

const Menu = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const gmp = useGmp();
  const tasksMatch = useMatch('/tasks');
  const taskMatch = useMatch('/task/*');
  const isTasksActive = Boolean(tasksMatch || taskMatch);

  const reportsMatch = useMatch('/reports');
  const reportMatch = useMatch('/report/*');
  const isReportsActive = Boolean(reportsMatch || reportMatch);

  const resultsMatch = useMatch('/results');
  const resultMatch = useMatch('/result/*');
  const isResultsActive = Boolean(resultsMatch || resultMatch);

  const vulnerabilitiesMatch = useMatch('/vulnerabilities');
  const vulnerabilityMatch = useMatch('/vulnerability/*');
  const isVulnerabilitiesActive = Boolean(
    vulnerabilitiesMatch || vulnerabilityMatch,
  );

  const notesMatch = useMatch('/notes');
  const noteMatch = useMatch('/note/*');
  const isNotesActive = Boolean(notesMatch || noteMatch);

  const overridesMatch = useMatch('/overrides');
  const overrideMatch = useMatch('/override/*');
  const isOverridesActive = Boolean(overridesMatch || overrideMatch);

  const hostsMatch = useMatch('/hosts');
  const hostDetailsMatch = useMatch('/host/*');
  const isHostsActive = Boolean(hostsMatch || hostDetailsMatch);

  const operatingSystemsMatch = useMatch('/operatingsystems');
  const operatingSystemMatch = useMatch('/operatingsystem/*');
  const isOperatingSystemsActive = Boolean(
    operatingSystemsMatch || operatingSystemMatch,
  );

  const tlsCertificatesMatch = useMatch('/tlscertificates');
  const tlsCertificateMatch = useMatch('/tlscertificate/*');
  const isTlsCertificatesActive = Boolean(
    tlsCertificatesMatch || tlsCertificateMatch,
  );

  const ticketsMatch = useMatch('/tickets');
  const ticketMatch = useMatch('/ticket/*');
  const isTicketsActive = Boolean(ticketsMatch || ticketMatch);

  const policiesMatch = useMatch('/policies');
  const policyMatch = useMatch('/policy/*');
  const isPoliciesActive = Boolean(policiesMatch || policyMatch);

  const auditsMatch = useMatch('/audits');
  const auditMatch = useMatch('/audit/*');
  const isAuditsActive = Boolean(auditsMatch || auditMatch);

  const auditReportsMatch = useMatch('/auditreports');
  const auditReportMatch = useMatch('/auditreport/*');
  const isAuditReportsActive = Boolean(auditReportsMatch || auditReportMatch);

  const nvtsMatch = useMatch('/nvts');
  const nvtMatch = useMatch('/nvt/*');
  const isNvtsActive = Boolean(nvtsMatch || nvtMatch);

  const cvesMatch = useMatch('/cves');
  const cveMatch = useMatch('/cve/*');
  const isCvesActive = Boolean(cvesMatch || cveMatch);

  const cpesMatch = useMatch('/cpes');
  const cpeMatch = useMatch('/cpe/*');
  const isCpesActive = Boolean(cpesMatch || cpeMatch);

  const certbundsMatch = useMatch('/certbunds');
  const certbundMatch = useMatch('/certbund/*');
  const isCertbundsActive = Boolean(certbundsMatch || certbundMatch);

  const dfncertsMatch = useMatch('/dfncerts');
  const dfncertMatch = useMatch('/dfncert/*');
  const isDfncertsActive = Boolean(dfncertsMatch || dfncertMatch);

  const targetsMatch = useMatch('/targets');
  const targetMatch = useMatch('/target/*');
  const isTargetsActive = Boolean(targetsMatch || targetMatch);

  const portlistsMatch = useMatch('/portlists');
  const portlistMatch = useMatch('/portlist/*');
  const isPortlistsActive = Boolean(portlistsMatch || portlistMatch);

  const credentialsMatch = useMatch('/credentials');
  const credentialMatch = useMatch('/credential/*');
  const isCredentialsActive = Boolean(credentialsMatch || credentialMatch);

  const scanConfigsMatch = useMatch('/scanconfigs');
  const scanConfigMatch = useMatch('/scanconfig/*');
  const isScanConfigsActive = Boolean(scanConfigsMatch || scanConfigMatch);

  const alertsMatch = useMatch('/alerts');
  const alertMatch = useMatch('/alert/*');
  const isAlertsActive = Boolean(alertsMatch || alertMatch);

  const schedulesMatch = useMatch('/schedules');
  const scheduleMatch = useMatch('/schedule/*');
  const isSchedulesActive = Boolean(schedulesMatch || scheduleMatch);

  const reportConfigsMatch = useMatch('/reportconfigs');
  const reportConfigMatch = useMatch('/reportconfig/*');
  const isReportConfigsActive = Boolean(
    reportConfigsMatch || reportConfigMatch,
  );

  const reportFormatsMatch = useMatch('/reportformats');
  const reportFormatMatch = useMatch('/reportformat/*');
  const isReportFormatsActive = Boolean(
    reportFormatsMatch || reportFormatMatch,
  );

  const scannersMatch = useMatch('/scanners');
  const scannerMatch = useMatch('/scanner/*');
  const isScannersActive = Boolean(scannersMatch || scannerMatch);

  const filtersMatch = useMatch('/filters');
  const filterMatch = useMatch('/filter/*');
  const isFiltersActive = Boolean(filtersMatch || filterMatch);

  const tagsMatch = useMatch('/tags');
  const tagMatch = useMatch('/tag/*');
  const isTagsActive = Boolean(tagsMatch || tagMatch);

  const usersMatch = useMatch('/users');
  const userMatch = useMatch('/user/*');
  const isUserActive = Boolean(usersMatch || userMatch);

  const groupsMatch = useMatch('/groups');
  const groupMatch = useMatch('/group/*');
  const isGroupsActive = Boolean(groupsMatch || groupMatch);

  const rolesMatch = useMatch('/roles');
  const roleMatch = useMatch('/role/*');
  const isRolesActive = Boolean(rolesMatch || roleMatch);

  const permissionsMatch = useMatch('/permissions');
  const permissionMatch = useMatch('/permission/*');
  const isPermissionsActive = Boolean(permissionsMatch || permissionMatch);

  const isPerformanceActive = Boolean(useMatch('/performance'));
  const isTrashcanActive = Boolean(useMatch('/trashcan'));
  const isFeedStatusActive = Boolean(useMatch('/feedstatus'));
  const isLdapActive = Boolean(useMatch('/ldap'));
  const isRadiusActive = Boolean(useMatch('/radius'));
  const isCvssCalculatorActive = Boolean(useMatch('/cvsscalculator'));
  const isAboutActive = Boolean(useMatch('/about'));

  const mayAccessAny = (keys: string[]) =>
    keys.some(key => isDefined(capabilities) && capabilities.mayAccess(key));

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
    'portlists',
    'credentials',
    'scanconfigs',
    'alerts',
    'schedules',
    'reportconfigs',
    'reportformats',
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
          capabilities?.mayAccess('tasks') && {
            label: _('Tasks'),
            to: '/tasks',
            active: isTasksActive,
          },
          capabilities?.mayAccess('reports') && {
            label: _('Reports'),
            to: '/reports',
            active: isReportsActive,
          },
          capabilities?.mayAccess('results') && {
            label: _('Results'),
            to: '/results',
            active: isResultsActive,
          },
          capabilities?.mayAccess('vulns') && {
            label: _('Vulnerabilities'),
            to: '/vulnerabilities',
            active: isVulnerabilitiesActive,
          },
          capabilities?.mayAccess('notes') && {
            label: _('Notes'),
            to: '/notes',
            active: isNotesActive,
          },
          capabilities?.mayAccess('overrides') && {
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
          capabilities?.mayAccess('assets') && {
            label: _('Hosts'),
            to: '/hosts',
            active: isHostsActive,
          },
          capabilities?.mayAccess('assets') && {
            label: _('Operating Systems'),
            to: '/operatingsystems',
            active: isOperatingSystemsActive,
          },
          capabilities?.mayAccess('tlscertificates') && {
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
          capabilities?.mayAccess('tickets') && {
            label: _('Remediation Tickets'),
            to: '/tickets',
            active: isTicketsActive,
          },
          capabilities?.mayAccess('policies') && {
            label: _('Compliance Policies'),
            to: '/policies',
            active: isPoliciesActive,
          },
          capabilities?.mayAccess('audits') && {
            label: _('Compliance Audits'),
            to: '/audits',
            active: isAuditsActive,
          },
          capabilities?.mayAccess('auditreports') && {
            label: _('Compliance Audit Reports'),
            to: '/auditreports',
            active: isAuditReportsActive,
          },
        ].filter(Boolean),
      },
      capabilities?.mayAccess('info') && {
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
          capabilities?.mayAccess('targets') && {
            label: _('Targets'),
            to: '/targets',
            active: isTargetsActive,
          },
          capabilities?.mayAccess('portlists') && {
            label: _('Port Lists'),
            to: '/portlists',
            active: isPortlistsActive,
          },
          capabilities?.mayAccess('credentials') && {
            label: _('Credentials'),
            to: '/credentials',
            active: isCredentialsActive,
          },
          capabilities?.mayAccess('scanconfigs') && {
            label: _('Scan Configs'),
            to: '/scanconfigs',
            active: isScanConfigsActive,
          },
          capabilities?.mayAccess('alerts') && {
            label: _('Alerts'),
            to: '/alerts',
            active: isAlertsActive,
          },
          capabilities?.mayAccess('schedules') && {
            label: _('Schedules'),
            to: '/schedules',
            active: isSchedulesActive,
          },
          capabilities?.mayAccess('reportconfigs') && {
            label: _('Report Configs'),
            to: '/reportconfigs',
            active: isReportConfigsActive,
          },
          capabilities?.mayAccess('reportformats') && {
            label: _('Report Formats'),
            to: '/reportformats',
            active: isReportFormatsActive,
          },
          capabilities?.mayAccess('scanners') && {
            label: _('Scanners'),
            to: '/scanners',
            active: isScannersActive,
          },
          capabilities?.mayAccess('filters') && {
            label: _('Filters'),
            to: '/filters',
            active: isFiltersActive,
          },
          capabilities?.mayAccess('tags') && {
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
          capabilities?.mayAccess('users') && {
            label: _('Users'),
            to: '/users',
            active: isUserActive,
          },
          capabilities?.mayAccess('groups') && {
            label: _('Groups'),
            to: '/groups',
            active: isGroupsActive,
          },
          capabilities?.mayAccess('roles') && {
            label: _('Roles'),
            to: '/roles',
            active: isRolesActive,
          },
          capabilities?.mayAccess('permissions') && {
            label: _('Permissions'),
            to: '/permissions',
            active: isPermissionsActive,
          },
          capabilities?.mayAccess('system_reports') && {
            label: _('Performance'),
            to: '/performance',
            active: isPerformanceActive,
          },
          {
            label: _('Trashcan'),
            to: '/trashcan',
            active: isTrashcanActive,
          },
          capabilities?.mayAccess('feeds') && {
            label: _('Feed Status'),
            to: '/feedstatus',
            active: isFeedStatusActive,
          },
          capabilities?.mayOp('describe_auth') &&
            capabilities?.mayOp('modify_auth') && {
              label: _('LDAP'),
              to: '/ldap',
              active: isLdapActive,
            },
          capabilities?.mayOp('describe_auth') &&
            capabilities?.mayOp('modify_auth') && {
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
  // @ts-expect-error
  return <AppNavigation as={Link} menuPoints={menuPoints} />;
};

export default Menu;
