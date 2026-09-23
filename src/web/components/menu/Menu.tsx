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
import {routeMatch, ROUTES} from 'web/route-paths';

const Menu = () => {
  const [_] = useTranslation();
  const capabilities = useCapabilities();
  const features = useFeatures();
  const gmp = useGmp();

  const dashboardsMatch = useMatch(routeMatch(ROUTES.dashboards.path));
  const isDashboardsActive = Boolean(dashboardsMatch);

  const tasksMatch = useMatch(routeMatch(ROUTES.tasks.path));
  const taskMatch = useMatch(routeMatch(ROUTES.task.path));
  const isTasksActive = Boolean(tasksMatch || taskMatch);
  const location = useLocation();

  const reportsMatch = useMatch(routeMatch(ROUTES.reports.path));
  const reportMatch = useMatch(routeMatch(ROUTES.report.path));
  const isReportsActive = Boolean(reportsMatch || reportMatch);

  const resultsMatch = useMatch(routeMatch(ROUTES.results.path));
  const resultMatch = useMatch(routeMatch(ROUTES.result.path));
  const isResultsActive = Boolean(resultsMatch || resultMatch);

  const vulnerabilitiesMatch = useMatch(
    routeMatch(ROUTES.vulnerabilities.path),
  );
  const vulnerabilityMatch = useMatch(routeMatch(ROUTES.vulnerability.path));
  const isVulnerabilitiesActive = Boolean(
    vulnerabilitiesMatch || vulnerabilityMatch,
  );

  const notesMatch = useMatch(routeMatch(ROUTES.notes.path));
  const noteMatch = useMatch(routeMatch(ROUTES.note.path));
  const isNotesActive = Boolean(notesMatch || noteMatch);

  const overridesMatch = useMatch(routeMatch(ROUTES.overrides.path));
  const overrideMatch = useMatch(routeMatch(ROUTES.override.path));
  const isOverridesActive = Boolean(overridesMatch || overrideMatch);

  const hostsMatch = useMatch(routeMatch(ROUTES.hosts.path));
  const hostDetailsMatch = useMatch(routeMatch(ROUTES.host.path));
  const isHostsActive = Boolean(hostsMatch || hostDetailsMatch);

  const operatingSystemsMatch = useMatch(
    routeMatch(ROUTES.operatingSystems.path),
  );
  const operatingSystemMatch = useMatch(
    routeMatch(ROUTES.operatingSystem.path),
  );
  const isOperatingSystemsActive = Boolean(
    operatingSystemsMatch || operatingSystemMatch,
  );

  const tlsCertificatesMatch = useMatch(
    routeMatch(ROUTES.tlsCertificates.path),
  );
  const tlsCertificateMatch = useMatch(routeMatch(ROUTES.tlsCertificate.path));
  const isTlsCertificatesActive = Boolean(
    tlsCertificatesMatch || tlsCertificateMatch,
  );

  const ticketsMatch = useMatch(routeMatch(ROUTES.tickets.path));
  const ticketMatch = useMatch(routeMatch(ROUTES.ticket.path));
  const isTicketsActive = Boolean(ticketsMatch || ticketMatch);

  const policiesMatch = useMatch(routeMatch(ROUTES.policies.path));
  const policyMatch = useMatch(routeMatch(ROUTES.policy.path));
  const isPoliciesActive = Boolean(policiesMatch || policyMatch);

  const auditsMatch = useMatch(routeMatch(ROUTES.audits.path));
  const auditMatch = useMatch(routeMatch(ROUTES.audit.path));
  const isAuditsActive = Boolean(auditsMatch || auditMatch);

  const auditReportsMatch = useMatch(routeMatch(ROUTES.auditReports.path));
  const auditReportMatch = useMatch(routeMatch(ROUTES.auditReport.path));
  const isAuditReportsActive = Boolean(auditReportsMatch || auditReportMatch);

  const nvtsMatch = useMatch(routeMatch(ROUTES.nvts.path));
  const nvtMatch = useMatch(routeMatch(ROUTES.nvt.path));
  const isNvtsActive = Boolean(nvtsMatch || nvtMatch);

  const cvesMatch = useMatch(routeMatch(ROUTES.cves.path));
  const cveMatch = useMatch(routeMatch(ROUTES.cve.path));
  const isCvesActive = Boolean(cvesMatch || cveMatch);

  const cpesMatch = useMatch(routeMatch(ROUTES.cpes.path));
  const cpeMatch = useMatch(routeMatch(ROUTES.cpe.path));
  const isCpesActive = Boolean(cpesMatch || cpeMatch);

  const certbundsMatch = useMatch(routeMatch(ROUTES.certBundAdvisories.path));
  const certbundMatch = useMatch(routeMatch(ROUTES.certBundAdvisory.path));
  const isCertbundsActive = Boolean(certbundsMatch || certbundMatch);

  const dfncertsMatch = useMatch(routeMatch(ROUTES.dfnCertAdvisories.path));
  const dfncertMatch = useMatch(routeMatch(ROUTES.dfnCertAdvisory.path));
  const isDfncertsActive = Boolean(dfncertsMatch || dfncertMatch);

  const targetsMatch = useMatch(routeMatch(ROUTES.targets.path));
  const targetMatch = useMatch(routeMatch(ROUTES.target.path));
  const isTargetsActive = Boolean(targetsMatch || targetMatch);

  const portlistsMatch = useMatch(routeMatch(ROUTES.portLists.path));
  const portlistMatch = useMatch(routeMatch(ROUTES.portList.path));
  const isPortlistsActive = Boolean(portlistsMatch || portlistMatch);

  const credentialsMatch = useMatch(routeMatch(ROUTES.credentials.path));
  const credentialMatch = useMatch(routeMatch(ROUTES.credential.path));
  const isCredentialsActive = Boolean(credentialsMatch || credentialMatch);

  const scanConfigsMatch = useMatch(routeMatch(ROUTES.scanConfigs.path));
  const scanConfigMatch = useMatch(routeMatch(ROUTES.scanConfig.path));
  const isScanConfigsActive = Boolean(scanConfigsMatch || scanConfigMatch);

  const alertsMatch = useMatch(routeMatch(ROUTES.alerts.path));
  const alertMatch = useMatch(routeMatch(ROUTES.alert.path));
  const isAlertsActive = Boolean(alertsMatch || alertMatch);

  const agentsMatch = useMatch(routeMatch(ROUTES.agents.path));
  const agentMatch = useMatch(routeMatch(ROUTES.agent.path));
  const isAgentsActive = Boolean(agentsMatch || agentMatch);

  const agentGroupsMatch = useMatch(routeMatch(ROUTES.agentGroups.path));
  const agentGroupMatch = useMatch(routeMatch(ROUTES.agentGroup.path));
  const isAgentGroupsActive = Boolean(agentGroupsMatch || agentGroupMatch);

  const agentInstallersMatch = useMatch(
    routeMatch(ROUTES.agentInstallers.path),
  );
  const agentInstallerMatch = useMatch(routeMatch(ROUTES.agentInstaller.path));
  const isAgentInstallersActive = Boolean(
    agentInstallersMatch || agentInstallerMatch,
  );

  const containerImageTargetsMatch = useMatch(
    routeMatch(ROUTES.ociImageTargets.path),
  );
  const containerImageTargetMatch = useMatch(
    routeMatch(ROUTES.containerImageTarget.path),
  );
  const isContainerImageTargetsActive = Boolean(
    containerImageTargetsMatch || containerImageTargetMatch,
  );

  const webApplicationTargetsMatch = useMatch(
    routeMatch(ROUTES.webApplicationTargets.path),
  );
  const webApplicationTargetMatch = useMatch(
    routeMatch(ROUTES.webApplicationTarget.path),
  );
  const isWebApplicationTargetsActive = Boolean(
    webApplicationTargetsMatch || webApplicationTargetMatch,
  );

  const schedulesMatch = useMatch(routeMatch(ROUTES.schedules.path));
  const scheduleMatch = useMatch(routeMatch(ROUTES.schedule.path));
  const isSchedulesActive = Boolean(schedulesMatch || scheduleMatch);

  const reportConfigsMatch = useMatch(routeMatch(ROUTES.reportConfigs.path));
  const reportConfigMatch = useMatch(routeMatch(ROUTES.reportConfig.path));
  const isReportConfigsActive = Boolean(
    reportConfigsMatch || reportConfigMatch,
  );

  const reportFormatsMatch = useMatch(routeMatch(ROUTES.reportFormats.path));
  const reportFormatMatch = useMatch(routeMatch(ROUTES.reportFormat.path));
  const isReportFormatsActive = Boolean(
    reportFormatsMatch || reportFormatMatch,
  );

  const scannersMatch = useMatch(routeMatch(ROUTES.scanners.path));
  const scannerMatch = useMatch(routeMatch(ROUTES.scanner.path));
  const isScannersActive = Boolean(scannersMatch || scannerMatch);

  const filtersMatch = useMatch(routeMatch(ROUTES.filters.path));
  const filterMatch = useMatch(routeMatch(ROUTES.filter.path));
  const isFiltersActive = Boolean(filtersMatch || filterMatch);

  const tagsMatch = useMatch(routeMatch(ROUTES.tags.path));
  const tagMatch = useMatch(routeMatch(ROUTES.tag.path));
  const isTagsActive = Boolean(tagsMatch || tagMatch);

  const usersMatch = useMatch(routeMatch(ROUTES.users.path));
  const userMatch = useMatch(routeMatch(ROUTES.user.path));
  const isUserActive = Boolean(usersMatch || userMatch);

  const groupsMatch = useMatch(routeMatch(ROUTES.groups.path));
  const groupMatch = useMatch(routeMatch(ROUTES.group.path));
  const isGroupsActive = Boolean(groupsMatch || groupMatch);

  const rolesMatch = useMatch(routeMatch(ROUTES.roles.path));
  const roleMatch = useMatch(routeMatch(ROUTES.role.path));
  const isRolesActive = Boolean(rolesMatch || roleMatch);

  const permissionsMatch = useMatch(routeMatch(ROUTES.permissions.path));
  const permissionMatch = useMatch(routeMatch(ROUTES.permission.path));
  const isPermissionsActive = Boolean(permissionsMatch || permissionMatch);

  const isPerformanceActive = Boolean(
    useMatch(routeMatch(ROUTES.performance.path)),
  );
  const isTrashcanActive = Boolean(useMatch(routeMatch(ROUTES.trashcan.path)));
  const isFeedStatusActive = Boolean(
    useMatch(routeMatch(ROUTES.feedStatus.path)),
  );
  const isLdapActive = Boolean(useMatch(routeMatch(ROUTES.ldap.path)));
  const isCredentialStoreActive = Boolean(
    useMatch(routeMatch(ROUTES.credentialStore.path)),
  );
  const isRadiusActive = Boolean(useMatch(routeMatch(ROUTES.radius.path)));
  const isCvssCalculatorActive = Boolean(
    useMatch(routeMatch(ROUTES.cvssCalculator.path)),
  );

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
        to: ROUTES.dashboards.url,
        key: 'dashboards',
        isPathMatch: Boolean(dashboardsMatch),
        active: isDashboardsActive,
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
            to: ROUTES.tasks.url,
            isPathMatch: Boolean(tasksMatch),
            active: isTasksActive,
          },
          capabilities.mayAccess('report') && {
            label: _('Reports'),
            to: ROUTES.reports.url,
            isPathMatch: Boolean(reportsMatch),
            active: isReportsActive,
          },
          capabilities.mayAccess('result') && {
            label: _('Results'),
            to: ROUTES.results.url,
            isPathMatch: Boolean(resultsMatch),
            active: isResultsActive,
          },
          capabilities.mayAccess('vulnerability') && {
            label: _('Vulnerabilities'),
            to: ROUTES.vulnerabilities.url,
            isPathMatch: Boolean(vulnerabilitiesMatch),
            active: isVulnerabilitiesActive,
          },
          capabilities.mayAccess('note') && {
            label: _('Notes'),
            to: ROUTES.notes.url,
            isPathMatch: Boolean(notesMatch),
            active: isNotesActive,
          },
          capabilities.mayAccess('override') && {
            label: _('Overrides'),
            to: ROUTES.overrides.url,
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
            to: ROUTES.hosts.url,
            isPathMatch: Boolean(hostsMatch),
            active: isHostsActive,
          },
          capabilities.mayAccess('operatingsystem') && {
            label: _('Operating Systems'),
            to: ROUTES.operatingSystems.url,
            isPathMatch: Boolean(operatingSystemsMatch),
            active: isOperatingSystemsActive,
          },
          capabilities.mayAccess('tlscertificate') && {
            label: _('TLS Certificates'),
            to: ROUTES.tlsCertificates.url,
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
            to: ROUTES.tickets.url,
            isPathMatch: Boolean(ticketsMatch),
            active: isTicketsActive,
          },
          capabilities.mayAccess('policy') && {
            label: _('Compliance Policies'),
            to: ROUTES.policies.url,
            isPathMatch: Boolean(policiesMatch),
            active: isPoliciesActive,
          },
          capabilities.mayAccess('audit') && {
            label: _('Compliance Audits'),
            to: ROUTES.audits.url,
            isPathMatch: Boolean(auditsMatch),
            active: isAuditsActive,
          },
          capabilities.mayAccess('auditreport') && {
            label: _('Compliance Audit Reports'),
            to: ROUTES.auditReports.url,
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
            to: ROUTES.nvts.url,
            isPathMatch: Boolean(nvtsMatch),
            active: isNvtsActive,
          },
          {
            label: _('CVEs'),
            to: ROUTES.cves.url,
            isPathMatch: Boolean(cvesMatch),
            active: isCvesActive,
          },
          {
            label: _('CPEs'),
            to: ROUTES.cpes.url,
            isPathMatch: Boolean(cpesMatch),
            active: isCpesActive,
          },
          {
            label: _('CERT-Bund Advisories'),
            to: ROUTES.certBundAdvisories.url,
            isPathMatch: Boolean(certbundsMatch),
            active: isCertbundsActive,
          },
          {
            label: _('DFN-CERT Advisories'),
            to: ROUTES.dfnCertAdvisories.url,
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
            to: ROUTES.targets.url,
            isPathMatch: Boolean(targetsMatch),
            active: isTargetsActive,
          },
          capabilities.mayAccess('ociimagetarget') &&
            features.featureEnabled('ENABLE_CONTAINER_SCANNING') && {
              label: _('Container Image Targets'),
              to: ROUTES.ociImageTargets.url,
              isPathMatch: Boolean(containerImageTargetsMatch),
              active: isContainerImageTargetsActive,
            },
          capabilities.mayAccess('webapplicationtarget') &&
            features.featureEnabled('ENABLE_WEB_APPLICATION_SCANNING') && {
              label: _('Web Application Targets'),
              to: ROUTES.webApplicationTargets.url,
              isPathMatch: Boolean(webApplicationTargetsMatch),
              active: isWebApplicationTargetsActive,
            },
          capabilities.mayAccess('portlist') && {
            label: _('Port Lists'),
            to: ROUTES.portLists.url,
            isPathMatch: Boolean(portlistsMatch),
            active: isPortlistsActive,
          },
          capabilities.mayAccess('credential') && {
            label: _('Credentials'),
            to: ROUTES.credentials.url,
            isPathMatch: Boolean(credentialsMatch),
            active: isCredentialsActive,
          },
          capabilities.mayAccess('scanconfig') && {
            label: _('Scan Configs'),
            to: ROUTES.scanConfigs.url,
            isPathMatch: Boolean(scanConfigsMatch),
            active: isScanConfigsActive,
          },
          capabilities.mayAccess('alert') && {
            label: _('Alerts'),
            to: ROUTES.alerts.url,
            isPathMatch: Boolean(alertsMatch),
            active: isAlertsActive,
          },
          capabilities.mayAccess('schedule') && {
            label: _('Schedules'),
            to: ROUTES.schedules.url,
            isPathMatch: Boolean(schedulesMatch),
            active: isSchedulesActive,
          },
          capabilities.mayAccess('reportconfig') && {
            label: _('Report Configs'),
            to: ROUTES.reportConfigs.url,
            isPathMatch: Boolean(reportConfigsMatch),
            active: isReportConfigsActive,
          },
          capabilities.mayAccess('reportformat') && {
            label: _('Report Formats'),
            to: ROUTES.reportFormats.url,
            isPathMatch: Boolean(reportFormatsMatch),
            active: isReportFormatsActive,
          },
          capabilities.mayAccess('scanner') && {
            label: _('Scanners'),
            to: ROUTES.scanners.url,
            isPathMatch: Boolean(scannersMatch),
            active: isScannersActive,
          },
          capabilities.mayAccess('filter') && {
            label: _('Filters'),
            to: ROUTES.filters.url,
            isPathMatch: Boolean(filtersMatch),
            active: isFiltersActive,
          },
          capabilities.mayAccess('tag') && {
            label: _('Tags'),
            to: ROUTES.tags.url,
            isPathMatch: Boolean(tagsMatch),
            active: isTagsActive,
          },
          capabilities.mayAccess('agent') &&
            features.featureEnabled('ENABLE_AGENTS') && {
              label: _('Agents'),
              to: ROUTES.agents.url,
              isPathMatch: Boolean(agentsMatch),
              active: isAgentsActive,
            },
          capabilities.mayAccess('agentgroup') &&
            features.featureEnabled('ENABLE_AGENTS') && {
              label: _('Agent Groups'),
              to: ROUTES.agentGroups.url,
              isPathMatch: Boolean(agentGroupsMatch),
              active: isAgentGroupsActive,
            },
          capabilities.mayOp('get_agent_installer_instruction') &&
            features.featureEnabled('ENABLE_AGENTS') && {
              label: _('Agent Installers'),
              to: ROUTES.agentInstallers.url,
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
            to: ROUTES.users.url,
            isPathMatch: Boolean(usersMatch),
            active: isUserActive,
          },
          capabilities.mayAccess('group') && {
            label: _('Groups'),
            to: ROUTES.groups.url,
            isPathMatch: Boolean(groupsMatch),
            active: isGroupsActive,
          },
          capabilities.mayAccess('role') && {
            label: _('Roles'),
            to: ROUTES.roles.url,
            isPathMatch: Boolean(rolesMatch),
            active: isRolesActive,
          },
          capabilities.mayAccess('permission') && {
            label: _('Permissions'),
            to: ROUTES.permissions.url,
            isPathMatch: Boolean(permissionsMatch),
            active: isPermissionsActive,
          },
          capabilities.mayOp('get_system_reports') && {
            label: _('Performance'),
            to: ROUTES.performance.url,
            isPathMatch: isPerformanceActive,
            active: isPerformanceActive,
          },
          {
            label: _('Trashcan'),
            to: ROUTES.trashcan.url,
            isPathMatch: isTrashcanActive,
            active: isTrashcanActive,
          },
          capabilities.mayOp('get_feeds') && {
            label: _('Feed Status'),
            to: ROUTES.feedStatus.url,
            isPathMatch: isFeedStatusActive,
            active: isFeedStatusActive,
          },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('LDAP'),
              to: ROUTES.ldap.url,
              isPathMatch: isLdapActive,
              active: isLdapActive,
            },
          capabilities.mayOp('describe_auth') &&
            features.featureEnabled('ENABLE_CREDENTIAL_STORES') &&
            capabilities.mayOp('modify_auth') && {
              label: _('Credential Store'),
              to: ROUTES.credentialStore.url,
              isPathMatch: isCredentialStoreActive,
              active: isCredentialStoreActive,
            },
          capabilities.mayOp('describe_auth') &&
            capabilities.mayOp('modify_auth') && {
              label: _('RADIUS'),
              to: ROUTES.radius.url,
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
            to: ROUTES.cvssCalculator.url,
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
