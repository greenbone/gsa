/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';
import {type Date} from 'gmp/models/date';
import {GREENBONE_SENSOR_SCANNER_TYPE} from 'gmp/models/scanner';
import {
  type default as Task,
  type TaskTrend as TaskTrendType,
} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import SeverityBar from 'web/components/bar/SeverityBar';
import Comment from 'web/components/comment/Comment';
import DateTime from 'web/components/date/DateTime';
import {AlterableIcon, ProvideViewIcon, SensorIcon} from 'web/components/icon';
import IconDivider from 'web/components/layout/IconDivider';
import Layout from 'web/components/layout/Layout';
import DetailsLink from 'web/components/link/DetailsLink';
import Link from 'web/components/link/Link';
import TableData from 'web/components/table/TableData';
import TableRow from 'web/components/table/TableRow';
import RowDetailsToggle from 'web/entities/RowDetailsToggle';
import ObserverIcon from 'web/entity/icon/ObserverIcon';
import useTranslation from 'web/hooks/useTranslation';
import useUserName from 'web/hooks/useUserName';
import TaskActions, {type TaskActionsProps} from 'web/pages/tasks/TaskActions';
import TaskStatus from 'web/pages/tasks/TaskStatus';
import TaskTrend from 'web/pages/tasks/TaskTrend';

interface TaskReportProps {
  report?: {id?: string; timestamp?: Date};
  links?: boolean;
}

interface TaskReportTotalProps {
  task: Task;
  links?: boolean;
}

export interface TaskRowProps extends TaskActionsProps {
  actionsComponent?: React.ComponentType<TaskActionsProps>;
  onToggleDetailsClick: (entity: Task, id: string) => void;
}

const TaskReport = ({report, links}: TaskReportProps) => {
  if (!isDefined(report)) {
    return null;
  }
  return (
    <span>
      <DetailsLink id={report.id as string} textOnly={!links} type="report">
        <DateTime date={report.timestamp} />
      </DetailsLink>
    </span>
  );
};

const TaskReportTotal = ({task, links = true}: TaskReportTotalProps) => {
  const {report_count: reportCount} = task;
  const [_] = useTranslation();
  if (!isDefined(reportCount?.total) || reportCount.total <= 0) {
    return null;
  }
  return (
    <Layout>
      <Link
        filter={`task_id=${task.id} sort-reverse=date`}
        textOnly={!links || reportCount.total === 0}
        title={_(
          'View list of all reports for Task {{name}},' +
            ' including unfinished ones',
          {name: task.name as string},
        )}
        to={'reports'}
      >
        {reportCount.total}
      </Link>
    </Layout>
  );
};

const TaskRow = ({
  actionsComponent: ActionsComponent = TaskActions,
  entity,
  links = true,
  onToggleDetailsClick,
  ...props
}: TaskRowProps) => {
  const [_] = useTranslation();
  const [username] = useUserName();
  const {scanner, observers, last_report: lastReport} = entity;

  const obs: {role: string; user: string; group: string} = {
    user: '',
    role: '',
    group: '',
  };

  let hasObservers = false;

  if (isDefined(observers)) {
    if (isDefined(observers.user)) {
      hasObservers = true;
      obs.user = _('Users {{user}}', {user: observers.user.join(', ')});
    }
    if (isDefined(observers.role)) {
      hasObservers = true;
      obs.role = _('Roles {{role}}', {role: observers.role.join(', ')});
    }
    if (isDefined(observers.group)) {
      hasObservers = true;
      obs.group = _('Groups {{group}}', {group: observers.group.join(', ')});
    }
  }

  return (
    <TableRow>
      <TableData>
        <Layout align="space-between">
          <div>
            <RowDetailsToggle
              name={entity.id}
              onClick={
                onToggleDetailsClick as (value: Task, name?: string) => void
              }
            >
              {entity.name}
            </RowDetailsToggle>
            {entity.comment && <Comment>({entity.comment})</Comment>}
          </div>
          <IconDivider>
            {entity.alterable === 1 && (
              <AlterableIcon size="small" title={_('Task is alterable')} />
            )}
            {isDefined(scanner) &&
              scanner.scannerType === GREENBONE_SENSOR_SCANNER_TYPE && (
                <SensorIcon
                  size="small"
                  title={_('Task is configured to run on sensor {{name}}', {
                    name: scanner.name as string,
                  })}
                />
              )}
            <ObserverIcon
              displayName={_('Task')}
              entity={entity}
              userName={username}
            />
            {hasObservers && (
              <ProvideViewIcon
                size="small"
                title={_(
                  'Task made visible for:\n{{user}}\n{{role}}\n{{group}}',
                  {
                    user: obs.user,
                    role: obs.role,
                    group: obs.group,
                  },
                )}
              />
            )}
          </IconDivider>
        </Layout>
      </TableData>
      <TableData>
        <TaskStatus links={links} task={entity} />
      </TableData>
      <TableData>
        <TaskReportTotal links={links} task={entity} />
      </TableData>
      <TableData>
        <TaskReport links={links} report={lastReport} />
      </TableData>
      <TableData>
        {!entity.isContainer() && isDefined(lastReport) && (
          <SeverityBar severity={lastReport.severity} />
        )}
      </TableData>
      <TableData align="center">
        {!entity.isContainer() && (
          <TaskTrend name={entity.trend as TaskTrendType} />
        )}
      </TableData>
      <ActionsComponent {...props} entity={entity} links={links} />
    </TableRow>
  );
};

export default TaskRow;
