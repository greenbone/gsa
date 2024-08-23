/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */


import React from 'react';

import useTranslation from 'web/hooks/useTranslation';

import {isDefined} from 'gmp/utils/identity';

import {TASK_STATUS, isActive} from 'gmp/models/task';

import StatusBar from 'web/components/bar/statusbar';

import DateTime from 'web/components/date/datetime';

import DeleteIcon from 'web/components/icon/deleteicon';
import DeltaIcon from 'web/components/icon/deltaicon';
import DeltaSecondIcon from 'web/components/icon/deltasecondicon';

import IconDivider from 'web/components/layout/icondivider';

import DetailsLink from 'web/components/link/detailslink';

import TableData from 'web/components/table/data';
import TableRow from 'web/components/table/row';

import withEntitiesActions from 'web/entities/withEntitiesActions';

import ComplianceBar from 'web/components/bar/compliancebar';

import PropTypes from 'web/utils/proptypes';

const Actions = withEntitiesActions(
  ({entity, selectedDeltaReport, onReportDeleteClick, onReportDeltaSelect}) => {
    const {report} = entity;

    const scanActive = isActive(report.scan_run_status);

    const [_] = useTranslation();
    const title = scanActive ? _('Scan is active') : _('Delete Report');

    return (
      <IconDivider align={['center', 'center']} grow>
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
              onClick={onReportDeltaSelect}
            />
          )
        ) : (
          <DeltaIcon
            title={_('Select Report for delta comparison')}
            value={entity}
            onClick={onReportDeltaSelect}
          />
        )}
        <DeleteIcon
          active={!scanActive}
          value={entity}
          title={title}
          onClick={scanActive ? undefined : onReportDeleteClick}
        />
      </IconDivider>
    );
  },
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  selectedDeltaReport: PropTypes.model,
  onReportDeleteClick: PropTypes.func.isRequired,
  onReportDeltaSelect: PropTypes.func.isRequired,
};

const AuditRow = ({
  actionsComponent: ActionsComponent = Actions,
  entity,
  links = true,
  ...props
}) => {
  const {report} = entity;
  const {scan_run_status, task} = report;

  let status = scan_run_status;
  let progress;

  if (isDefined(task)) {
    if (task.isContainer() && status !== TASK_STATUS.processing) {
      status =
        status === TASK_STATUS.interrupted
          ? TASK_STATUS.uploadinginterrupted
          : status === TASK_STATUS.running || status === TASK_STATUS.processing
            ? TASK_STATUS.uploading
            : TASK_STATUS.container;
    }
    progress = task.progress;
  }

  return (
    <TableRow>
      <TableData>
        <span>
          <DetailsLink type="auditreport" id={entity.id} textOnly={!links}>
            <DateTime date={report.timestamp} />
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <StatusBar status={status} progress={progress} />
      </TableData>
      <TableData>
        <span>
          <DetailsLink type="task" id={entity.task.id} textOnly={!links}>
            {entity.task.name}
          </DetailsLink>
        </span>
      </TableData>
      <TableData>
        <ComplianceBar compliance={report.compliance.filtered} />
      </TableData>
      <TableData align="end">{report.complianceCounts.yes.filtered}</TableData>
      <TableData align="end">{report.complianceCounts.no.filtered}</TableData>
      <TableData align="end">
        {report.complianceCounts.incomplete.filtered}
      </TableData>
      <ActionsComponent {...props} entity={entity} />
    </TableRow>
  );
};

AuditRow.propTypes = {
  actionsComponent: PropTypes.component,
  entity: PropTypes.model.isRequired,
  links: PropTypes.bool,
};

export default AuditRow;