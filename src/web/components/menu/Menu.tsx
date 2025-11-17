/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {AppNavigation} from '@greenbone/ui-lib';
import {
  BarChart3,
  CircleHelp,
  FileCheck,
  Server,
  ShieldCheck,
  SlidersHorizontal,
  View,
  Wrench,
} from 'lucide-react';
import {useLocation, useMatch} from 'react-router';
import {type EntityType} from 'gmp/utils/entity-type';
import {isDefined} from 'gmp/utils/identity';
import Link from 'web/components/link/Link';
import useCapabilities from 'web/hooks/useCapabilities';
import useFeatures from 'web/hooks/useFeatures';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';

const Menu = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const gmp = useGmp();
  const tasksMatch = useMatch('/tasks');
  const taskMatch = useMatch('/task/*');
  const isTasksActive = Boolean(tasksMatch || taskMatch);
  const location = useLocation();

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

  const agentsMatch = useMatch('/agents');
  const agentMatch = useMatch('/agent/*');
  const isAgentsActive = Boolean(agentsMatch || agentMatch);

  const agentGroupsMatch = useMatch('/agent-groups');
  const agentGroupMatch = useMatch('/agent-group/*');
  const isAgentGroupsActive = Boolean(agentGroupsMatch || agentGroupMatch);

  const agentInstallersMatch = useMatch('/agent-installers');
  const agentInstallerMatch = useMatch('/agent-installer/*');
  const isAgentInstallersActive = Boolean(
    agentInstallersMatch || agentInstallerMatch,
  );

  const containerImageTargetsMatch = useMatch('/ociimagetargets');
  const containerImageTargetMatch = useMatch('/ociimagetarget/*');
  const isContainerImageTargetsActive = Boolean(
    containerImageTargetsMatch || containerImageTargetMatch,
  );

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
  const isCredentialStoreActive = Boolean(useMatch('/credentialstore'));
  const isRadiusActive = Boolean(useMatch('/radius'));
  const isCvssCalculatorActive = Boolean(useMatch('/cvsscalculator'));

  const mayAccessAny = (keys: EntityType[]) =>
    keys.some(key => isDefined(capabilities) && capabilities.mayAccess(key));

  const mayOpScans = mayAccessAny([
    'task',
    'report',
    'result',
    'vulnerability',
    'override',
    'note',
  ]);
  const mayOpConfiguration = mayAccessAny([
    'agent',
    'agentgroup',
    'agentinstaller',
    'target',
    'ociimagetarget',
    'portlist',
    'credential',
    'scanconfig',
    'alert',
    'schedule',
    'reportconfig',
    'reportformat',
    'scanner',
    'filter',
    'tag',
  ]);
  const mayOpResilience = mayAccessAny([
    'ticket',
    'policy',
    'audit',
    'auditreport',
  ]);
  const mayOpAssets = mayAccessAny(['asset', 'tlscertificate']);

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
        defaultOpened: [
          isTasksActive,
          isReportsActive,
          isResultsActive,
          isVulnerabilitiesActive,
          isNotesActive,
          isOverridesActive,
        ].some(Boolean),
        subNav: [
          capabilities.mayAccess('task') && {
            label: _('Tasks'),
            to: '/tasks',
            isPathMatch: Boolean(tasksMatch),
            active: isTasksActive,
          },
          capabilities.mayAccess('report') && {
            label: _('Reports'),
            to: '/reports',
            isPathMatch: Boolean(reportsMatch),
            active: isReportsActive,
          },
          capabilities.mayAccess('result') && {
            label: _('Results'),
            to: '/results',
            isPathMatch: Boolean(resultsMatch),
            active: isResultsActive,
          },
          capabilities.mayAccess('vulnerability') && {
            label: _('Vulnerabilities'),
            to: '/vulnerabilities',
            isPathMatch: Boolean(vulnerabilitiesMatch),
            active: isVulnerabilitiesActive,
          },
          capabilities.mayAccess('note') && {
            label: _('Notes'),
            to: '/notes',
            isPathMatch: Boolean(notesMatch),
            active: isNotesActive,
          },
          capabilities.mayAccess('override') && {
            label: _('Overrides'),
            to: '/overrides',
            isPathMatch: Boolean(overridesMatch),
            active: isOverridesActive,
          },
        ].filter(Boolean),
      },
      mayOpAssets && {
        icon: Server,
        label: _('Assets'),
        key: 'assets',
        defaultOpened: [
          isHostsActive,
          isOperatingSystemsActive,
          isTlsCertificatesActive,
        ].some(Boolean),
        subNav: [
          capabilities.mayAccess('host') && {
            label: _('Hosts'),
            to: '/hosts',
            isPathMatch: Boolean(hostsMatch),
            active: isHostsActive,
          },
          capabilities.mayAccess('operatingsystem') && {
            label: _('Operating Systems'),
            to: '/operatingsystems',
            isPathMatch: Boolean(operatingSystemsMatch),
            active: isOperatingSystemsActive,
          },
          capabilities.mayAccess('tlscertificate') && {
            label: _('TLS Certificates'),
            to: '/tlscertificates',
            isPathMatch: Boolean(tlsCertificatesMatch),
            active: isTlsCertificatesActive,
          },
        ].filter(Boolean),
      },
      mayOpResilience && {
        icon: FileCheck,
        label: _('Resilience'),
        key: 'resilience',
        defaultOpened: [
          isTicketsActive,
          isPoliciesActive,
          isAuditsActive,
          isAuditReportsActive,
        ].some(Boolean),
        subNav: [
          capabilities.mayAccess('ticket') && {
            label: _('Remediation Tickets'),
            to: '/tickets',
            isPathMatch: Boolean(ticketsMatch),
            active: isTicketsActive,
          },
          capabilities.mayAccess('policy') && {
            label: _('Compliance Policies'),
            to: '/policies',
            isPathMatch: Boolean(policiesMatch),
            active: isPoliciesActive,
          },
          capabilities.mayAccess('audit') && {
            label: _('Compliance Audits'),
            to: '/audits',
            isPathMatch: Boolean(auditsMatch),
            active: isAuditsActive,
          },
          capabilities.mayAccess('auditreport') && {
            label: _('Compliance Audit Reports'),
            to: '/auditreports',
            isPathMatch: Boolean(auditReportsMatch),
            active: isAuditReportsActive,
          },
        ].filter(Boolean),
      },
      capabilities.mayAccess('info') && {
        icon: View,
        label: _('Security Information'),
        key: 'secInfo',
        defaultOpened: [
          isNvtsActive,
          isCvesActive,
          isCpesActive,
          isCertbundsActive,
          isDfncertsActive,
        ].some(Boolean),
        subNav: [
          {
            label: _('NVTs'),
            to: '/nvts',
            isPathMatch: Boolean(nvtsMatch),
            active: isNvtsActive,
          },
          {
            label: _('CVEs'),
            to: '/cves',
            isPathMatch: Boolean(cvesMatch),
            active: isCvesActive,
          },
          {
            label: _('CPEs'),
            to: '/cpes',
            isPathMatch: Boolean(cpesMatch),
            active: isCpesActive,
          },
          {
            label: _('CERT-Bund Advisories'),
            to: '/certbunds',
            isPathMatch: Boolean(certbundsMatch),
            active: isCertbundsActive,
          },
          {
            label: _('DFN-CERT Advisories'),
            to: '/dfncerts',
            isPathMatch: Boolean(dfncertsMatch),
            active: isDfncertsActive,
          },
        ],
      },
      mayOpConfiguration && {
        icon: Wrench,
        label: _('Configuration'),
        key: 'configuration',
        defaultOpened: [
          isTargetsActive,
          isContainerImageTargetsActive,
          isPortlistsActive,
          isCredentialsActive,
          isScanConfigsActive,
          isAlertsActive,
          isSchedulesActive,
          isReportConfigsActive,
          isReportFormatsActive,
          isScannersActive,
          isFiltersActive,
          isTagsActive,
          isAgentsActive,
          isAgentGroupsActive,
          isAgentInstallersActive,
        ].some(Boolean),
        subNav: [
          capabilities.mayAccess('target') && {
            label: _('Targets'),
            to: '/targets',
            isPathMatch: Boolean(targetsMatch),
            active: isTargetsActive,
          },
          capabilities.mayAccess('ociimagetarget') &&
            features.featureEnabled('ENABLE_CONTAINER_SCANNING') && {
              label: _('Container Image Targets'),
              to: '/ociimagetargets',
              isPathMatch: Boolean(containerImageTargetsMatch),
              active: isContainerImageTargetsActive,
            },
          capabilities.mayAccess('portlist') && {
            label: _('Port Lists'),
            to: '/portlists',
            isPathMatch: Boolean(portlistsMatch),
            active: isPortlistsActive,
          },
          capabilities.mayAccess('credential') && {
            label: _('Credentials'),
            to: '/credentials',
            isPathMatch: Boolean(credentialsMatch),
            active: isCredentialsActive,
          },
          capabilities.mayAccess('scanconfig') && {
            label: _('Scan Configs'),
            to: '/scanconfigs',
            isPathMatch: Boolean(scanConfigsMatch),
            active: isScanConfigsActive,
          },
          capabilities.mayAccess('alert') && {
            label: _('Alerts'),
            to: '/alerts',
            isPathMatch: Boolean(alertsMatch),
            active: isAlertsActive,
          },
          capabilities.mayAccess('schedule') && {
            label: _('Schedules'),
            to: '/schedules',
            isPathMatch: Boolean(schedulesMatch),
            active: isSchedulesActive,
          },
          capabilities.mayAccess('reportconfig') && {
            label: _('Report Configs'),
            to: '/reportconfigs',
            isPathMatch: Boolean(reportConfigsMatch),
            active: isReportConfigsActive,
          },
          capabilities.mayAccess('reportformat') && {
            label: _('Report Formats'),
            to: '/reportformats',
            isPathMatch: Boolean(reportFormatsMatch),
            active: isReportFormatsActive,
          },
          capabilities.mayAccess('scanner') && {
            label: _('Scanners'),
            to: '/scanners',
            isPathMatch: Boolean(scannersMatch),
            active: isScannersActive,
          },
          capabilities.mayAccess('filter') && {
            label: _('Filters'),
            to: '/filters',
            isPathMatch: Boolean(filtersMatch),
            active: isFiltersActive,
          },
          capabilities.mayAccess('tag') && {
            label: _('Tags'),
            to: '/tags',
            isPathMatch: Boolean(tagsMatch),
            active: isTagsActive,
          },
          capabilities.mayAccess('agent') &&
            features.featureEnabled('ENABLE_AGENTS') && {
              label: _('Agents'),
              to: '/agents',
              isPathMatch: Boolean(agentsMatch),
              active: isAgentsActive,
            },
          capabilities.mayAccess('agentgroup') &&
            features.featureEnabled('ENABLE_AGENTS') && {
              label: _('Agent Groups'),
              to: '/agent-groups',
              isPathMatch: Boolean(agentGroupsMatch),
              active: isAgentGroupsActive,
            },
          capabilities.mayAccess('agentinstaller') &&
            features.featureEnabled('ENABLE_AGENTS') && {
              label: _('Agent Installers'),
              to: '/agent-installers',
              isPathMatch: Boolean(agentInstallersMatch),
              active: isAgentInstallersActive,
            },
        ].filter(Boolean),
      },
      {
        label: _('Administration'),
        key: 'administration',
        icon: SlidersHorizontal,
        defaultOpened: [
          isUserActive,
          isGroupsActive,
          isRolesActive,
          isPermissionsActive,
          isPerformanceActive,
          isTrashcanActive,
          isFeedStatusActive,
          isLdapActive,
          isCredentialStoreActive,
          isRadiusActive,
        ].some(Boolean),
        subNav: [
          capabilities.mayAccess('user') && {
            label: _('Users'),
            to: '/users',
            isPathMatch: Boolean(usersMatch),
            active: isUserActive,
          },
          capabilities.mayAccess('group') && {
            label: _('Groups'),
            to: '/groups',
            isPathMatch: Boolean(groupsMatch),
            active: isGroupsActive,
          },
          capabilities.mayAccess('role') && {
            label: _('Roles'),
            to: '/roles',
            isPathMatch: Boolean(rolesMatch),
            active: isRolesActive,
          },
          capabilities.mayAccess('permission') && {
            label: _('Permissions'),
            to: '/permissions',
            isPathMatch: Boolean(permissionsMatch),
            active: isPermissionsActive,
          },
          capabilities.mayOp('get_system_reports') && {
            label: _('Performance'),
            to: '/performance',
            isPathMatch: isPerformanceActive,
            active: isPerformanceActive,
          },
          {
            label: _('Trashcan'),
            to: '/trashcan',
            isPathMatch: isTrashcanActive,
            active: isTrashcanActive,
          },
          capabilities.mayOp('get_feeds') && {
            label: _('Feed Status'),
            to: '/feedstatus',
            isPathMatch: isFeedStatusActive,
            active: isFeedStatusActive,
          },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('LDAP'),
              to: '/ldap',
              isPathMatch: isLdapActive,
              active: isLdapActive,
            },
          capabilities.mayOp('describe_auth') &&
            features.featureEnabled('ENABLE_CREDENTIAL_STORES') &&
            capabilities.mayOp('modify_auth') && {
              label: _('Credential Store'),
              to: '/credentialstore',
              isPathMatch: isCredentialStoreActive,
              active: isCredentialStoreActive,
            },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('RADIUS'),
              to: '/radius',
              isPathMatch: isRadiusActive,
              active: isRadiusActive,
            },
        ].filter(Boolean),
      },
      {
        label: _('Help'),
        key: 'help',
        icon: CircleHelp,
        defaultOpened: [isCvssCalculatorActive].some(Boolean),
        subNav: [
          {
            label: _('CVSS Calculator'),
            to: '/cvsscalculator',
            isPathMatch: isCvssCalculatorActive,
            active: isCvssCalculatorActive,
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
  return (
    <AppNavigation
      key={location.pathname}
      as={Link}
      // @ts-expect-error
      menuPoints={menuPoints}
    />
  );
};

export default Menu;
