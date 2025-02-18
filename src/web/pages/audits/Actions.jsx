/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import _ from 'gmp/locale';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import DownloadIcon from 'web/components/icon/DownloadIcon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import ResumeIcon from 'web/pages/tasks/icons/ResumeIcon';
import ScheduleIcon from 'web/pages/tasks/icons/ScheduleIcon';
import StartIcon from 'web/pages/tasks/icons/StartIcon';
import StopIcon from 'web/pages/tasks/icons/StopIcon';
import PropTypes from 'web/utils/PropTypes';

const Actions = ({
  entity,
  links,
  gcrFormatDefined,
  onReportDownloadClick,
  onAuditCloneClick,
  onAuditDeleteClick,
  onAuditDownloadClick,
  onAuditEditClick,
  onAuditResumeClick,
  onAuditStartClick,
  onAuditStopClick,
}) => (
  <IconDivider grow align={['center', 'center']}>
    {isDefined(entity.schedule) ? (
      <ScheduleIcon links={links} schedule={entity.schedule} />
    ) : (
      <StartIcon
        task={entity}
        usageType={_('audit')}
        onClick={onAuditStartClick}
      />
    )}
    <StopIcon task={entity} usageType={_('audit')} onClick={onAuditStopClick} />
    <ResumeIcon
      task={entity}
      usageType={_('audit')}
      onClick={onAuditResumeClick}
    />
    <TrashIcon
      displayName="Audit"
      entity={entity}
      name="task"
      onClick={onAuditDeleteClick}
    />
    <EditIcon
      displayName="Audit"
      entity={entity}
      name="task"
      onClick={onAuditEditClick}
    />
    <CloneIcon
      displayName="Audit"
      entity={entity}
      name="task"
      onClick={onAuditCloneClick}
    />
    <ExportIcon
      title={_('Export Audit')}
      value={entity}
      onClick={onAuditDownloadClick}
    />
    <DownloadIcon
      disabled={!gcrFormatDefined || !isDefined(entity.last_report)}
      title={
        gcrFormatDefined && isDefined(entity.last_report)
          ? _('Download Greenbone Compliance Report')
          : _('Report download not available')
      }
      value={entity}
      onClick={onReportDownloadClick}
    />
  </IconDivider>
);

Actions.propTypes = {
  entity: PropTypes.model.isRequired,
  gcrFormatDefined: PropTypes.bool,
  links: PropTypes.bool,
  onAuditCloneClick: PropTypes.func.isRequired,
  onAuditDeleteClick: PropTypes.func.isRequired,
  onAuditDownloadClick: PropTypes.func.isRequired,
  onAuditEditClick: PropTypes.func.isRequired,
  onAuditResumeClick: PropTypes.func.isRequired,
  onAuditStartClick: PropTypes.func.isRequired,
  onAuditStopClick: PropTypes.func.isRequired,
  onReportDownloadClick: PropTypes.func.isRequired,
};

export default withEntitiesActions(Actions);
