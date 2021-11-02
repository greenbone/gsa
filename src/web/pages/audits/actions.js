/* Copyright (C) 2019-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import IconDivider from 'web/components/layout/icondivider';

import ExportIcon from 'web/components/icon/exporticon';

import withEntitiesActions from 'web/entities/withEntitiesActions';

import CloneIcon from 'web/entity/icon/cloneicon';
import EditIcon from 'web/entity/icon/editicon';
import TrashIcon from 'web/entity/icon/trashicon';
import DownloadIcon from 'web/components/icon/downloadicon';

import ResumeIcon from 'web/pages/tasks/icons/resumeicon';
import ScheduleIcon from 'web/pages/tasks/icons/scheduleicon';
import StartIcon from 'web/pages/tasks/icons/starticon';
import StopIcon from 'web/pages/tasks/icons/stopicon';

import PropTypes from 'web/utils/proptypes';

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
  <IconDivider align={['center', 'center']} grow>
    {isDefined(entity.schedule) ? (
      <ScheduleIcon schedule={entity.schedule} links={links} />
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
      entity={entity}
      name="task"
      displayName="Audit"
      onClick={onAuditDeleteClick}
    />
    <EditIcon
      entity={entity}
      name="task"
      displayName="Audit"
      onClick={onAuditEditClick}
    />
    <CloneIcon
      entity={entity}
      name="task"
      displayName="Audit"
      onClick={onAuditCloneClick}
    />
    <ExportIcon
      value={entity}
      title={_('Export Audit')}
      onClick={onAuditDownloadClick}
    />
    <DownloadIcon
      value={entity}
      title={
        gcrFormatDefined && isDefined(entity.last_report)
          ? _('Download Greenbone Compliance Report')
          : _('Report download not available')
      }
      onClick={onReportDownloadClick}
      disabled={!gcrFormatDefined || !isDefined(entity.last_report)}
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

// vim: set ts=2 sw=2 tw=80:
