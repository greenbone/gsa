/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {isDefined} from 'gmp/utils/identity';
import {DownloadIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import IconDivider from 'web/components/layout/IconDivider';
import withEntitiesActions from 'web/entities/withEntitiesActions';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import TaskResumeIcon from 'web/pages/tasks/icons/TaskResumeIcon';
import TaskScheduleIcon from 'web/pages/tasks/icons/TaskScheduleIcon';
import TaskStartIcon from 'web/pages/tasks/icons/TaskStartIcon';
import TaskStopIcon from 'web/pages/tasks/icons/TaskStopIcon';
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
}) => {
  const [_] = useTranslation();

  return (
    <IconDivider grow align={['center', 'center']}>
      {isDefined(entity.schedule) ? (
        <TaskScheduleIcon links={links} schedule={entity.schedule} />
      ) : (
        <TaskStartIcon
          task={entity}
          usageType={_('audit')}
          onClick={onAuditStartClick}
        />
      )}
      <TaskStopIcon
        task={entity}
        usageType={_('audit')}
        onClick={onAuditStopClick}
      />
      <TaskResumeIcon
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
};

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
