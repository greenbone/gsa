/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import styled from 'styled-components';
import type Audit from 'gmp/models/audit';
import {type default as Task, TASK_STATUS, USAGE_TYPE} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import StatusBar from 'web/components/bar/StatusBar';
import DetailsLink from 'web/components/link/DetailsLink';

interface TaskStatusProps {
  task: Task | Audit;
  links?: boolean;
}

const StyledDetailsLink = styled(DetailsLink)`
  &:hover {
    text-decoration: none;
  }
`;

const isTask = (taskOrAudit: Task | Audit): taskOrAudit is Task =>
  (taskOrAudit as Task).usageType === USAGE_TYPE.scan;

const hasNoScanResults = (task: Task) => {
  const resultCount = task.last_report?.result_count;
  return (
    !isDefined(task.last_report) ||
    (isDefined(resultCount) &&
      Object.values(resultCount).every(count => count === 0))
  );
};

const TaskStatus = ({task, links = true}: TaskStatusProps) => {
  let report_id: string | undefined;
  if (isDefined(task.current_report)) {
    report_id = task.current_report.id;
  } else if (isDefined(task.last_report)) {
    report_id = task.last_report.id;
  } else {
    report_id = '';
    links = false;
  }
  const isImport = task.isImport();
  const status =
    isTask(task) &&
    task.isAgent() &&
    task.status === TASK_STATUS.done &&
    hasNoScanResults(task)
      ? TASK_STATUS.noresults
      : task.status;
  let statusBarStatus = status;
  if (isImport) {
    if (status === TASK_STATUS.interrupted) {
      statusBarStatus = TASK_STATUS.uploadinginterrupted;
    } else if (
      status === TASK_STATUS.running ||
      status === TASK_STATUS.processing
    ) {
      statusBarStatus = TASK_STATUS.processing;
    } else {
      statusBarStatus = TASK_STATUS.import;
    }
  }
  return (
    <StyledDetailsLink
      id={report_id}
      textOnly={!links}
      type={isTask(task) ? 'report' : 'auditreport'}
    >
      <StatusBar progress={task.progress} status={statusBarStatus} />
    </StyledDetailsLink>
  );
};

export default TaskStatus;
