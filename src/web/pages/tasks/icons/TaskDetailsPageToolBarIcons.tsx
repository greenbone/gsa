/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type Task from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import Badge from 'web/components/badge/Badge';
import {
  AlterableIcon,
  NoteIcon,
  OverrideIcon,
  ReportIcon,
  ResultIcon,
} from 'web/components/icon';
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
import NewIconMenu from 'web/pages/tasks/icons/NewIconMenu';
import TaskIconWithSync from 'web/pages/tasks/icons/TaskIconWithSync';
import TaskImportReportIcon from 'web/pages/tasks/icons/TaskImportReportIcon';
import TaskScheduleIcon from 'web/pages/tasks/icons/TaskScheduleIcon';
import TaskStopIcon from 'web/pages/tasks/icons/TaskStopIcon';
import {formattedUserSettingShortDate} from 'web/utils/user-setting-time-date-formatters';

interface TaskDetailsPageToolBarIconsProps {
  entity: Task;
  links?: boolean;
  notesCount?: number;
  overridesCount?: number;
  onImportTaskCreateClick?: () => void | Promise<void>;
  onReportImportClick?: (value: Task) => void | Promise<void>;
  onTaskCloneClick?: (value: Task) => void | Promise<void>;
  onTaskCreateClick?: () => void | Promise<void>;
  onTaskDeleteClick?: (value: Task) => void | Promise<void>;
  onTaskDownloadClick?: (value: Task) => void | Promise<void>;
  onTaskEditClick?: (value: Task) => void | Promise<void>;
  onTaskResumeClick?: (value: Task) => void | Promise<void>;
  onTaskStartClick?: (value: Task) => void | Promise<void>;
  onTaskStopClick?: (value: Task) => void | Promise<void>;
}

export const TaskDetailsPageToolBarIcons = ({
  entity,
  links,
  notesCount = 0,
  overridesCount = 0,
  onTaskDeleteClick,
  onTaskCloneClick,
  onTaskDownloadClick,
  onTaskEditClick,
  onReportImportClick,
  onTaskCreateClick,
  onImportTaskCreateClick,
  onTaskStartClick,
  onTaskStopClick,
  onTaskResumeClick,
}: TaskDetailsPageToolBarIconsProps) => {
  const [_] = useTranslation();
  const {
    current_report: currentReport,
    last_report: lastReport,
    report_count: reportCount,
    result_count: resultCount,
  } = entity;
  return (
    <Divider margin="10px">
      <IconDivider align={['start', 'start']}>
        <ManualIcon
          anchor="managing-tasks"
          page="scanning"
          title={_('Help: Tasks')}
        />
        <ListIcon page="tasks" title={_('Task List')} />
        {entity.isAlterable() && !entity.isNew() && (
          <AlterableIcon
            title={_(
              'This is an Alterable Task. Reports may not relate to ' +
                'current Scan Config or Target!',
            )}
          />
        )}
      </IconDivider>

      <IconDivider>
        <NewIconMenu
          onNewClick={onTaskCreateClick}
          onNewImportTaskClick={onImportTaskCreateClick}
        />
        <CloneIcon entity={entity} name="task" onClick={onTaskCloneClick} />
        <EditIcon entity={entity} name="task" onClick={onTaskEditClick} />
        <TrashIcon entity={entity} name="task" onClick={onTaskDeleteClick} />
        <ExportIcon
          title={_('Export Task as XML')}
          value={entity}
          onClick={onTaskDownloadClick}
        />
      </IconDivider>

      <IconDivider>
        {isDefined(entity.schedule) && (
          <TaskScheduleIcon links={links} schedule={entity.schedule} />
        )}
        <TaskIconWithSync
          task={entity}
          type="start"
          onClick={onTaskStartClick}
        />

        <TaskImportReportIcon task={entity} onClick={onReportImportClick} />

        <TaskStopIcon task={entity} onClick={onTaskStopClick} />

        {!entity.isImport() && (
          <TaskIconWithSync
            task={entity}
            type="resume"
            onClick={onTaskResumeClick}
          />
        )}
      </IconDivider>

      <Divider margin="10px">
        <IconDivider>
          {isDefined(currentReport) && (
            <DetailsLink
              id={currentReport.id}
              title={_('Current Report for Task {{- name}} from {{- date}}', {
                name: entity.name as string,
                date: formattedUserSettingShortDate(
                  currentReport.scan_start,
                ) as string,
              })}
              type="report"
            >
              <ReportIcon />
            </DetailsLink>
          )}

          {!isDefined(currentReport) && isDefined(lastReport) && (
            <DetailsLink
              id={lastReport.id}
              title={_('Last Report for Task {{- name}} from {{- date}}', {
                name: entity.name as string,
                date: formattedUserSettingShortDate(
                  lastReport.scan_start,
                ) as string,
              })}
              type="report"
            >
              <ReportIcon />
            </DetailsLink>
          )}

          <Link
            filter={'task_id=' + entity.id}
            title={_('Total Reports for Task {{- name}}', {
              name: entity.name as string,
            })}
            to="reports"
          >
            <Badge content={reportCount?.total ?? 0}>
              <ReportIcon />
            </Badge>
          </Link>
        </IconDivider>

        <Link
          filter={'task_id=' + entity.id}
          title={_('Results for Task {{- name}}', {
            name: entity.name as string,
          })}
          to="results"
        >
          <Badge content={resultCount}>
            <ResultIcon />
          </Badge>
        </Link>

        <IconDivider>
          <Link
            filter={'task_id=' + entity.id}
            title={_('Notes for Task {{- name}}', {
              name: entity.name as string,
            })}
            to="notes"
          >
            <Badge content={notesCount}>
              <NoteIcon />
            </Badge>
          </Link>

          <Link
            filter={'task_id=' + entity.id}
            title={_('Overrides for Task {{- name}}', {
              name: entity.name as string,
            })}
            to="overrides"
          >
            <Badge content={overridesCount}>
              <OverrideIcon />
            </Badge>
          </Link>
        </IconDivider>
      </Divider>
    </Divider>
  );
};

export default TaskDetailsPageToolBarIcons;
