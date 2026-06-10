/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import _ from 'gmp/locale';
import type Filter from 'gmp/models/filter';
import type ReportReport from 'gmp/models/report/report';
import type ReportTLSCertificate from 'gmp/models/report/tls-certificate';
import {type TaskStatus} from 'gmp/models/task';
import Loading from 'web/components/loading/Loading';
import EntityTags from 'web/entity/Tags';
import type {ReportSubEntities} from 'web/hooks/use-query/use-report-sub-entities';
import ApplicationsTab from 'web/pages/reports/details/application/ApplicationsTab';
import ClosedCvesTab from 'web/pages/reports/details/cve/ClosedCvesTab';
import CvesTab from 'web/pages/reports/details/cve/CvesTab';
import ErrorsTab from 'web/pages/reports/details/error/ErrorsTab';
import HostsTabContent from 'web/pages/reports/details/host/HostsTabContent';
import OperatingSystemsTab from 'web/pages/reports/details/operating-system/OperatingSystemsTab';
import PortsTab from 'web/pages/reports/details/port/PortsTab';
import ResultsTabContent from 'web/pages/reports/details/result/ResultsTabContent';
import Summary from 'web/pages/reports/details/Summary';
import TabTitle from 'web/pages/reports/details/TabTitle';
import ThresholdPanel from 'web/pages/reports/details/ThresholdPanel';
import TLSCertificatesTab from 'web/pages/reports/details/tls-certificate/TlsCertificatesTab';

export interface ThresholdConfig {
  showInitialLoading: boolean;
  showThresholdMessage: boolean;
  isUpdating: boolean;
  threshold: number;
  onFilterChanged: (filter: Filter) => void;
  onFilterEditClick: () => void;
}

interface TabDefinition {
  key: string;
  renderTab: () => React.ReactNode;
  renderPanel: () => React.ReactNode;
}

interface BuildReportTabDefinitionsParams {
  activeReport: ReportReport;
  activeFilter: Filter;
  reportId: string;
  isImport: boolean;
  isAgentScanning: boolean;
  isContainerScanning: boolean;
  isUpdating: boolean;
  progress: number;
  status: TaskStatus;
  resultsCounts?: {filtered?: number; full?: number};
  thresholdConfig: ThresholdConfig;
  reportEntities: ReportSubEntities;
  onFilterAddLogLevelClick: () => void;
  onFilterDecreaseMinQoDClick: () => void;
  onFilterEditClick: () => void;
  onFilterRemoveClick: () => void;
  onFilterRemoveSeverityClick: () => void;
  onTargetEditClick: () => void;
  onTlsCertificateDownloadClick: (entity: ReportTLSCertificate) => void;
  onTagSuccess: () => void;
  onError: (error: Error) => void;
}

export const renderWithThreshold = (
  entityType: string,
  activeFilter: Filter,
  config: ThresholdConfig,
  content: React.ReactNode,
): React.ReactNode => {
  if (config.showInitialLoading) {
    return <Loading />;
  }

  if (config.showThresholdMessage) {
    return (
      <ThresholdPanel
        entityType={entityType}
        filter={activeFilter}
        isUpdating={config.isUpdating}
        threshold={config.threshold}
        onFilterChanged={config.onFilterChanged}
        onFilterEditClick={config.onFilterEditClick}
      />
    );
  }

  return content;
};

export const buildReportTabDefinitions = ({
  activeReport,
  activeFilter,
  reportId,
  isImport,
  isAgentScanning,
  isContainerScanning,
  isUpdating,
  progress,
  status,
  resultsCounts,
  thresholdConfig,
  reportEntities,
  onFilterAddLogLevelClick,
  onFilterDecreaseMinQoDClick,
  onFilterEditClick,
  onFilterRemoveClick,
  onFilterRemoveSeverityClick,
  onTargetEditClick,
  onTlsCertificateDownloadClick,
  onTagSuccess,
  onError,
}: BuildReportTabDefinitionsParams): TabDefinition[] => [
  {
    key: 'information',
    renderTab: () => _('Information'),
    renderPanel: () => (
      <Summary
        filter={activeFilter}
        isUpdating={isUpdating}
        report={activeReport}
        reportError={undefined}
        reportId={reportId}
      />
    ),
  },
  {
    key: 'results',
    renderTab: () => (
      <TabTitle
        counts={
          resultsCounts
            ? {
                filtered: resultsCounts.filtered ?? 0,
                all: resultsCounts.full ?? 0,
              }
            : undefined
        }
        isLoading={isUpdating && !resultsCounts}
        title={_('Results')}
      />
    ),
    renderPanel: () => (
      <ResultsTabContent
        hasTarget={!isImport}
        isContainerScanning={isContainerScanning}
        progress={progress}
        reportFilter={activeFilter}
        reportId={reportId}
        reportResultsCounts={resultsCounts}
        status={status}
        onFilterAddLogLevelClick={onFilterAddLogLevelClick}
        onFilterDecreaseMinQoDClick={onFilterDecreaseMinQoDClick}
        onFilterEditClick={onFilterEditClick}
        onFilterRemoveClick={onFilterRemoveClick}
        onFilterRemoveSeverityClick={onFilterRemoveSeverityClick}
        onTargetEditClick={onTargetEditClick}
      />
    ),
  },
  {
    key: 'hosts',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.hosts.data?.entitiesCounts}
        title={_('Hosts')}
      />
    ),
    renderPanel: () =>
      renderWithThreshold(
        _('Hosts'),
        activeFilter,
        thresholdConfig,
        <HostsTabContent
          hostsData={reportEntities.hosts.data}
          isAgentScanning={isAgentScanning}
          isContainerScanning={isContainerScanning}
          isHostsError={reportEntities.hosts.isError}
          isHostsFetching={reportEntities.hosts.isFetching}
          reportFilter={activeFilter}
          reportId={reportId}
        />,
      ),
  },
  {
    key: 'ports',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.ports.data?.entitiesCounts}
        title={_('Ports')}
      />
    ),
    renderPanel: () => (
      <PortsTab
        isPortsError={reportEntities.ports.isError}
        isPortsFetching={reportEntities.ports.isFetching}
        portsData={reportEntities.ports.data}
        reportFilter={activeFilter}
        reportId={reportId}
      />
    ),
  },
  {
    key: 'applications',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.applications.data?.entitiesCounts}
        title={_('Applications')}
      />
    ),
    renderPanel: () =>
      renderWithThreshold(
        _('Applications'),
        activeFilter,
        thresholdConfig,
        <ApplicationsTab
          applicationsData={reportEntities.applications.data}
          filter={activeFilter}
          isApplicationsError={reportEntities.applications.isError}
          isApplicationsFetching={reportEntities.applications.isFetching}
          reportId={reportId}
        />,
      ),
  },
  {
    key: 'os',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.operatingSystems.data?.entitiesCounts}
        title={_('Operating Systems')}
      />
    ),
    renderPanel: () =>
      renderWithThreshold(
        _('Operating Systems'),
        activeFilter,
        thresholdConfig,
        <OperatingSystemsTab
          filter={activeFilter}
          isOperatingSystemsError={reportEntities.operatingSystems.isError}
          isOperatingSystemsFetching={
            reportEntities.operatingSystems.isFetching
          }
          operatingSystemsData={reportEntities.operatingSystems.data}
          reportId={reportId}
        />,
      ),
  },
  {
    key: 'cves',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.cves.data?.entitiesCounts}
        isLoading={reportEntities.cves.isFetching && !reportEntities.cves.data}
        title={_('CVEs')}
      />
    ),
    renderPanel: () =>
      renderWithThreshold(
        _('CVEs'),
        activeFilter,
        thresholdConfig,
        <CvesTab
          cvesData={reportEntities.cves.data}
          filter={activeFilter}
          isCvesError={reportEntities.cves.isError}
          isCvesFetching={reportEntities.cves.isFetching}
          reportId={reportId}
        />,
      ),
  },
  {
    key: 'closedcves',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.closedCves.data?.entitiesCounts}
        isLoading={
          reportEntities.closedCves.isFetching &&
          !reportEntities.closedCves.data
        }
        title={_('Closed CVEs')}
      />
    ),
    renderPanel: () =>
      renderWithThreshold(
        _('Closed CVEs'),
        activeFilter,
        thresholdConfig,
        <ClosedCvesTab
          closedCvesData={reportEntities.closedCves.data}
          filter={activeFilter}
          isClosedCvesError={reportEntities.closedCves.isError}
          isClosedCvesFetching={reportEntities.closedCves.isFetching}
          reportId={reportId}
        />,
      ),
  },
  {
    key: 'tlscerts',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.tlsCertificates.data?.entitiesCounts}
        isLoading={
          reportEntities.tlsCertificates.isFetching &&
          !reportEntities.tlsCertificates.data
        }
        title={_('TLS Certificates')}
      />
    ),
    renderPanel: () =>
      renderWithThreshold(
        _('TLS Certificates'),
        activeFilter,
        thresholdConfig,
        <TLSCertificatesTab
          isTlsCertificatesError={reportEntities.tlsCertificates.isError}
          isTlsCertificatesFetching={reportEntities.tlsCertificates.isFetching}
          reportFilter={activeFilter}
          reportId={reportId}
          tlsCertificatesData={reportEntities.tlsCertificates.data}
          onTlsCertificateDownloadClick={onTlsCertificateDownloadClick}
        />,
      ),
  },
  {
    key: 'errors',
    renderTab: () => (
      <TabTitle
        counts={reportEntities.errors.data?.entitiesCounts}
        isLoading={
          reportEntities.errors.isFetching && !reportEntities.errors.data
        }
        title={_('Error Messages')}
      />
    ),
    renderPanel: () => (
      <ErrorsTab
        errorsData={reportEntities.errors.data}
        filter={activeFilter}
        isErrorsError={reportEntities.errors.isError}
        isErrorsFetching={reportEntities.errors.isFetching}
        reportId={reportId}
      />
    ),
  },
  {
    key: 'usertags',
    renderTab: () => (
      <TabTitle
        count={activeReport.userTags?.length ?? 0}
        title={_('User Tags')}
      />
    ),
    renderPanel: () => (
      <EntityTags
        entity={activeReport}
        onChanged={onTagSuccess}
        onError={onError}
      />
    ),
  },
];
