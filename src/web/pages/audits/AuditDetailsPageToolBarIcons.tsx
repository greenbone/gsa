/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Audit from 'gmp/models/audit';
import {isDefined} from 'gmp/utils/identity';
import Badge from 'web/components/badge/Badge';
import {AlterableIcon, ReportIcon, ResultIcon} from 'web/components/icon';
import ExportIcon from 'web/components/icon/ExportIcon';
import ListIcon from 'web/components/icon/ListIcon';
import ManualIcon from 'web/components/icon/ManualIcon';
import Divider from 'web/components/layout/Divider';
import IconDivider from 'web/components/layout/IconDivider';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import CloneIcon from 'web/entity/icon/CloneIcon';
import EditIcon from 'web/entity/icon/EditIcon';
import TrashIcon from 'web/entity/icon/TrashIcon';
import useTranslation from 'web/hooks/useTranslation';
import TaskResumeIcon from 'web/pages/tasks/icons/TaskResumeIcon';
import TaskScheduleIcon from 'web/pages/tasks/icons/TaskScheduleIcon';
import TaskStartIcon from 'web/pages/tasks/icons/TaskStartIcon';
import TaskStopIcon from 'web/pages/tasks/icons/TaskStopIcon';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

interface AuditDetailsPageToolBarIconsProps {
  entity: Audit;
  links?: boolean;
  onAuditDeleteClick: () => void;
  onAuditCloneClick: () => void;
  onAuditDownloadClick: () => void;
  onAuditEditClick: () => void;
  onAuditStartClick: () => void;
  onAuditStopClick: () => void;
  onAuditResumeClick: () => void;
}

const AuditDetailsPageToolBarIcons = ({
  entity,
  links,
  onAuditDeleteClick,
  onAuditCloneClick,
  onAuditDownloadClick,
  onAuditEditClick,
  onAuditStartClick,
  onAuditStopClick,
  onAuditResumeClick,
}: AuditDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          anchor="configuring-and-managing-audits"
          page="compliance-and-special-scans"
          title={_('Help: Audits')}
        />
        <ListIcon page="audits" title={_('Audit List')} />
        {entity.isAlterable() && !entity.isNew() && (
          <AlterableIcon
            title={_(
              'This is an Alterable Audit. Reports may not relate to ' +
                'current Policy or Target!',
            )}
          />
        )}
      </IconDivider>

      <IconDivider>
        <CloneIcon
          displayName={_('Audit')}
          entity={entity}
          name="task"
          onClick={onAuditCloneClick}
        />
        <EditIcon
          displayName={_('Audit')}
          entity={entity}
          name="task"
          onClick={onAuditEditClick}
        />
        <TrashIcon
          displayName={_('Audit')}
          entity={entity}
          name="task"
          onClick={onAuditDeleteClick}
        />
        <ExportIcon
          title={_('Export Audit as XML')}
          value={entity}
          onClick={onAuditDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {isDefined(entity.schedule) && (
          <TaskScheduleIcon links={links} schedule={entity.schedule} />
        )}
        <TaskStartIcon task={entity} onClick={onAuditStartClick} />

        <TaskStopIcon task={entity} onClick={onAuditStopClick} />

        {!entity.isImport() && (
          <TaskResumeIcon task={entity} onClick={onAuditResumeClick} />
        )}
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {isDefined(entity.current_report) && (
            <DetailsLink
              id={entity.current_report.id}
              title={_('Current Report for Audit {{- name}} from {{- date}}', {
                name: entity.name as string,
                date: formattedUserSettingShortDate(
                  entity.current_report.scan_start,
                ) as string,
              })}
              type="report"
            >
              <ReportIcon />
            </DetailsLink>
          )}

          {!isDefined(entity.current_report) &&
            isDefined(entity.last_report) && (
              <DetailsLink
                id={entity.last_report.id}
                title={_('Last Report for Audit {{- name}} from {{- date}}', {
                  name: entity.name as string,
                  date: formattedUserSettingShortDate(
                    entity.last_report.scan_start,
                  ) as string,
                })}
                type="auditreport"
              >
                <ReportIcon />
              </DetailsLink>
            )}

          <Link
            filter={'task_id=' + entity.id}
            title={_('Total Reports for Audit {{- name}}', {
              name: entity.name as string,
            })}
            to="auditreports"
          >
            <Badge content={entity.report_count?.total}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          filter={'task_id=' + entity.id}
          title={_('Results for Audit {{- name}}', {
            name: entity.name as string,
          })}
          to="results"
        >
          <Badge content={entity.result_count}>
            <ResultIcon />
          </Badge>
        </Link>
      </Divider>
    </Divider>
  );
};

export default AuditDetailsPageToolBarIcons;
