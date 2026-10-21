/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type React from 'react';
import styled from 'styled-components';
import {type Date} from 'gmp/models/date';
import type ReportTask from 'gmp/models/report/task';
import {
  getTranslatableTaskStatus,
  TASK_STATUS,
  type TaskStatus,
} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import {adjustProgress} from 'web/components/bar/ProgressBar';
import DateTime from 'web/components/date/DateTime';
import {
  AlertCircleIcon,
  AuditIcon,
  CheckIcon,
  ContainerIcon,
  GlobeIcon,
  HatAndGlassesIcon,
  RadarIcon,
  ReportIcon,
} from 'web/components/icon';
import useTranslation from 'web/hooks/useTranslation';
import Theme from 'web/utils/theme';

interface ReportDetailsHeaderProps {
  audit?: boolean;
  isLoading?: boolean;
  metadata?: React.ReactNode;
  progress?: string | number;
  scannerContact?: React.ReactNode;
  status?: TaskStatus;
  task?: ReportTask;
  timestamp?: Date | string;
}

const Header = styled.header`
  margin: 26px 0 16px;
`;

const SummaryCard = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 20px;
  align-items: start;
  padding: 20px 24px;
  border: 1px solid ${Theme.lightGray};
  border-radius: 12px;
  background: linear-gradient(135deg, ${Theme.white}, ${Theme.dialogGray});
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);

  @media (max-width: 760px) {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 18px;
  }
`;

type StatusTone = 'error' | 'low' | 'neutral' | 'new' | 'run' | 'warn';

const statusColors = {
  error: {
    background: Theme.lightRed,
    border: Theme.mediumLightRed,
    color: Theme.errorRed,
  },
  low: {
    background: '#edf5fb',
    border: Theme.severityLowBlue,
    color: Theme.severityLowBlue,
  },
  neutral: {
    background: Theme.dialogGray,
    border: Theme.mediumDarkGray,
    color: Theme.darkGray,
  },
  new: {
    background: '#f4f8e9',
    border: Theme.statusNewGreen,
    color: Theme.statusNewGreen,
  },
  run: {
    background: '#eef8e4',
    border: Theme.statusRunGreen,
    color: Theme.statusRunGreen,
  },
  warn: {
    background: '#fff7e6',
    border: Theme.severityWarnYellow,
    color: Theme.severityWarnYellow,
  },
};

const IconTile = styled.div`
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  grid-row: 1 / span 2;
  border: 1px solid ${Theme.lightGray};
  border-radius: 12px;
  background: ${Theme.dialogGray};

  svg {
    max-width: 48px;
    max-height: 48px;
  }

  @media (max-width: 760px) {
    grid-row: auto;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Eyebrow = styled.p`
  margin: 0 0 4px;
  color: ${Theme.mediumGray};
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Title = styled.h2`
  margin: 0;
  color: ${Theme.black};
  font-size: 22px;
  line-height: 1.2;
`;

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`;

const TypeBadge = styled.span`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 3px 7px;
  border: 1px solid ${Theme.lightGray};
  border-radius: 5px;
  color: ${Theme.darkGray};
  background: ${Theme.white};
  font-size: 11px;
  font-weight: normal;
  line-height: 1;
`;

const Timestamp = styled.div`
  margin-top: 8px;
  color: ${Theme.mediumGray};
  font-size: 12px;
  line-height: 1.4;
`;

const StatusPanel = styled.div<{$tone: StatusTone}>`
  display: inline-flex;
  gap: 4px;
  align-items: center;
  padding: 3px 7px;
  border: 1px solid ${props => statusColors[props.$tone].border};
  border-radius: 5px;
  color: ${props => statusColors[props.$tone].color};
  background: ${props => statusColors[props.$tone].background};
`;

const StatusText = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
`;

const StatusLabel = styled.div`
  font-size: 11px;
  font-weight: bold;
  line-height: 1.2;
`;

const StatusDetail = styled.div`
  font-size: 11px;
  line-height: 1.35;
`;

const Metadata = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 2fr) repeat(3, minmax(100px, 1fr));
  gap: 10px;
  margin-top: -1px;
  padding: 10px 14px;
  border: 1px solid ${Theme.lightGray};
  border-radius: 0 0 12px 12px;
  background: ${Theme.dialogGray};
  font-size: 10px;

  table {
    display: contents;
  }

  tbody {
    display: contents;
  }

  tr {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    margin: 0;
  }

  td:first-child {
    color: ${Theme.mediumGray};
    font-size: 9px;
    font-weight: bold;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  td:nth-child(2) {
    overflow-wrap: anywhere;
    color: ${Theme.darkGray};
    font-size: 10px;
  }

  tr:first-child td:nth-child(2) {
    width: fit-content;
    padding: 2px 4px;
    border: 1px solid ${Theme.mediumDarkGray};
    border-radius: 4px;
    background: ${Theme.white};
    font-family: monospace;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const getReportPresentation = (
  task: ReportTask | undefined,
  audit: boolean,
  _: (key: string) => string,
) => {
  if (audit) {
    return {
      icon: <AuditIcon size="small" title={_('Audit Report')} />,
      typeLabel: _('Audit'),
      title: _('Audit Report'),
    };
  }

  if (isDefined(task?.agentGroup)) {
    return {
      icon: <HatAndGlassesIcon size="small" title={_('Agent Task')} />,
      typeLabel: _('Agents Scan'),
      title: _('Report'),
    };
  }

  if (isDefined(task?.ociImageTarget)) {
    return {
      icon: <ContainerIcon size="small" title={_('Container Image Task')} />,
      typeLabel: _('Container Scan'),
      title: _('Report'),
    };
  }

  if (isDefined(task?.webApplicationTarget)) {
    return {
      icon: <GlobeIcon size="small" title={_('Web Application Task')} />,
      typeLabel: _('Web Application Scan'),
      title: _('Report'),
    };
  }

  return {
    icon: <RadarIcon size="small" title={_('Task')} />,
    typeLabel: _('Scan'),
    title: _('Report'),
  };
};

const getStatusTone = (status: TaskStatus): StatusTone => {
  if (status === TASK_STATUS.interrupted) return 'error';
  if (
    status === TASK_STATUS.stopped ||
    status === TASK_STATUS.stoprequested ||
    status === TASK_STATUS.deleterequested ||
    status === TASK_STATUS.ultimatedeleterequested ||
    status === TASK_STATUS.resumerequested ||
    status === TASK_STATUS.requested ||
    status === TASK_STATUS.queued
  ) {
    return 'warn';
  }
  if (status === TASK_STATUS.running || status === TASK_STATUS.processing) {
    return 'run';
  }
  if (
    status === TASK_STATUS.uploading ||
    status === TASK_STATUS.done ||
    status === TASK_STATUS.noresults ||
    status === TASK_STATUS.import
  ) {
    return 'low';
  }
  if (status === TASK_STATUS.new) return 'new';
  return 'neutral';
};

const ReportDetailsHeader = ({
  audit = false,
  isLoading = false,
  metadata,
  progress = 0,
  scannerContact,
  status = TASK_STATUS.unknown,
  task,
  timestamp,
}: ReportDetailsHeaderProps) => {
  const [_] = useTranslation();
  const {icon, title, typeLabel} = getReportPresentation(task, audit, _);
  const tone = getStatusTone(status);
  const adjustedProgress = adjustProgress(progress);
  const isTerminalFailure =
    status === TASK_STATUS.interrupted || status === TASK_STATUS.stopped;
  const statusLabel = isTerminalFailure
    ? _('{{status}} at {{progress}} %', {
        status: _(getTranslatableTaskStatus(status)),
        progress: adjustedProgress,
      })
    : _(getTranslatableTaskStatus(status));

  return (
    <Header className="report-details-header">
      <SummaryCard>
        <IconTile>
          <ReportIcon size="large" title={_('Report')} />
        </IconTile>
        <TitleBlock>
          <TitleRow>
            <Title>{title}</Title>
            <TypeBadge>
              {icon}
              {typeLabel}
            </TypeBadge>
            <StatusPanel $tone={tone} data-testid="report-status-panel">
              {tone === 'error' ? (
                <AlertCircleIcon size="tiny" title={_('Interrupted')} />
              ) : tone === 'low' ? (
                <CheckIcon size="tiny" title={statusLabel} />
              ) : (
                <ReportIcon size="tiny" title={statusLabel} />
              )}

              <StatusText>
                <StatusLabel>
                  {isLoading ? _('Loading') : statusLabel}
                </StatusLabel>
                {!isLoading && scannerContact && (
                  <StatusDetail>{scannerContact}</StatusDetail>
                )}
              </StatusText>
            </StatusPanel>
          </TitleRow>
          {!isLoading && (
            <Timestamp data-testid="report-timestamp">
              <DateTime date={timestamp} />
            </Timestamp>
          )}
        </TitleBlock>
      </SummaryCard>
      {metadata && <Metadata>{metadata}</Metadata>}
    </Header>
  );
};

export default ReportDetailsHeader;
