/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import type Report from 'gmp/models/report';
import {TASK_STATUS, isActive} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import StatusBar from 'web/components/bar/StatusBar';
import DateTime from 'web/components/date/DateTime';
import {
  CircleXDeleteIcon,
  DeltaIcon,
  DeltaSecondIcon,
} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import withEntitiesActions, {
  type WithEntitiesActionsProps,
  type WithEntitiesActionsComponentProps,
} from 'web/entities/withEntitiesActions';
import useGmp from 'web/hooks/useGmp';
import useTranslation from 'web/hooks/useTranslation';
import {AgentIdTableData} from 'web/pages/agents/components/AgentIdColumn';

interface ReportActionsProps extends WithEntitiesActionsComponentProps<Report> {
  selectedDeltaReport?: Report;
  onReportDeleteClick?: (report: Report) => Promise<void>;
  onReportDeltaSelect?: (report: Report) => void;
}

export interface ReportTableRowProps
  extends
    WithEntitiesActionsProps<Report, ReportActionsProps>,
    ReportActionsProps {
  actionsComponent?: React.ComponentType<ReportActionsProps>;
  links?: boolean;
}

const ReportActions = withEntitiesActions(
  ({
    entity,
    selectedDeltaReport,
    onReportDeleteClick,
    onReportDeltaSelect,
  }: ReportActionsProps) => {
    const [_] = useTranslation();
    const {report} = entity;
    const scanActive = isActive(report?.scan_run_status);

    const title = scanActive ? _('Scan is active') : _('Delete Report');

    return (
      <IconDivider grow align={['center', 'center']}>
        {isDefined(selectedDeltaReport) ? (
          entity.id === selectedDeltaReport.id ? (
            <DeltaIcon
              active={false}
              title={_('Report is selected for delta comparison')}
            />
          ) : (
            <DeltaSecondIcon
              title={_('Select Report for delta comparison')}
              value={entity}
              onClick={
                onReportDeltaSelect as (report?: Report) => Promise<void>
              }
            />
          )
        ) : (
          <DeltaIcon
            title={_('Select Report for delta comparison')}
            value={entity}
            onClick={onReportDeltaSelect as (report?: Report) => Promise<void>}
          />
        )}
        <CircleXDeleteIcon
          active={!scanActive}
          title={title}
          value={entity}
          onClick={
            scanActive
              ? undefined
              : (onReportDeleteClick as (report?: Report) => Promise<void>)
          }
        />
      </IconDivider>
    );
  },
);

const ReportTableRow = ({
  actionsComponent: ActionsComponent = ReportActions,
  entity,
  links = true,
  ...props
}: ReportTableRowProps) => {
  const gmp = useGmp();
  const {report} = entity;
  const scan_run_status = report?.scan_run_status;
  const task = report?.task;

  let status = scan_run_status;
  let progress: number | undefined = undefined;

  if (isDefined(task)) {
    if (task.isImport() && status !== TASK_STATUS.processing) {
      status =
        status === TASK_STATUS.interrupted
          ? TASK_STATUS.uploadinginterrupted
          : status === TASK_STATUS.running
            ? TASK_STATUS.uploading
            : TASK_STATUS.import;
    }
    progress = task.progress;
  }

  const useCVSSv3 = gmp.settings.severityRating === 'CVSSv3';
  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink id={entity.id as string} textOnly={!links} type="report">
            <DateTime date={report?.timestamp} />
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <StatusBar progress={progress} status={status} />
      </TableData>
      <TableData>
        <span>
          <DetailsLink id={task?.id as string} textOnly={!links} type="task">
            {task?.name}
          </DetailsLink>
        </span>
      </TableData>
      <AgentIdTableData agentId={task?.agentGroup?.id} />
      <TableData>
        <SeverityBar severity={report?.severity?.filtered} />
      </TableData>
      {useCVSSv3 && (
        <TableData>{report?.result_count?.critical?.filtered}</TableData>
      )}
      <TableData align="end">{report?.result_count?.high?.filtered}</TableData>
      <TableData align="end">
        {report?.result_count?.medium?.filtered}
      </TableData>
      <TableData align="end">{report?.result_count?.low?.filtered}</TableData>
      <TableData align="end">{report?.result_count?.log?.filtered}</TableData>
      <TableData align="end">
        {report?.result_count?.false_positive?.filtered}
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

export default ReportTableRow;
