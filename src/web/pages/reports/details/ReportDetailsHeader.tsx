/* SPDX-FileCopyrightText: 2026 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type React from 'react';
import styled from 'styled-components';
import {type Date} from 'gmp/models/date';
import type ReportTask from 'gmp/models/report/task';
import {TASK_STATUS, type TaskStatus} from 'gmp/models/task';
import StatusBar from 'web/components/bar/StatusBar';
import DateTime from 'web/components/date/DateTime';
import {AuditIcon, CalendarIcon, ReportIcon} from 'web/components/icon';
import Row from 'web/components/layout/Row';
import TaskTypePill from 'web/components/status/TaskTypePill';
import useTranslation from 'web/hooks/useTranslation';
import getReportTaskTypePresentation from 'web/pages/reports/details/ReportTaskType';
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
  margin: 16px 0 12px;
`;

const SummaryCard = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;
`;

const IconTile = styled.div`
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border: 0;
  border-radius: 6px;
  background: ${Theme.dialogGray};

  svg {
    max-width: 50px;
    max-height: 50px;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  color: ${Theme.black};
  font-size: 24px;
  line-height: 24px;
`;

const StatusWithDetail = styled.div`
  display: inline-flex;
  gap: 6px;
  align-items: center;
`;

const ScannerContact = styled.span`
  color: ${Theme.mediumGray};
  font-size: 11px;
`;

const Timestamp = styled.div`
  display: inline-flex;
  box-sizing: border-box;
  gap: 5px;
  height: 24px;
  align-items: center;
  padding: 0 7px;
  border: 1px solid ${Theme.lightGray};
  border-radius: 5px;
  color: ${Theme.darkGray};
  background: ${Theme.white};
  font-size: 12px;
  font-weight: 500;
  line-height: 1.35;
`;

const Metadata = styled.div`
  justify-self: end;
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

  const {icon, label} = getReportTaskTypePresentation(task, _);
  return {
    icon,
    typeLabel: label,
    title: _('Report'),
  };
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
  return (
    <Header className="report-details-header">
      <SummaryCard>
        <IconTile>
          <ReportIcon size="large" title={_('Report')} />
        </IconTile>
        <TitleBlock>
          <Row gap={8} wrap="wrap">
            <Title>{title}</Title>
            {!isLoading && (
              <Timestamp data-testid="report-timestamp">
                <CalendarIcon size="tiny" />
                <DateTime date={timestamp} />
              </Timestamp>
            )}
          </Row>
          <Row gap={8} mt={5} wrap="wrap">
            <TaskTypePill>
              {icon}
              {typeLabel}
            </TaskTypePill>
            <StatusWithDetail data-testid="report-status-panel">
              <StatusBar progress={progress} status={status} />
              {!isLoading && scannerContact && (
                <ScannerContact>{scannerContact}</ScannerContact>
              )}
            </StatusWithDetail>
          </Row>
        </TitleBlock>
        {metadata && <Metadata>{metadata}</Metadata>}
      </SummaryCard>
    </Header>
  );
};

export default ReportDetailsHeader;
