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
  return (
    <StyledDetailsLink
      id={report_id}
      textOnly={!links}
      type={task.usageType === USAGE_TYPE.audit ? 'auditreport' : 'report'}
    >
      <StatusBar
        progress={task.progress}
        status={
          task.isContainer()
            ? task.status === TASK_STATUS.interrupted
              ? TASK_STATUS.uploadinginterrupted
              : task.status === TASK_STATUS.running ||
                  task.status === TASK_STATUS.processing
                ? TASK_STATUS.processing
                : TASK_STATUS.container
            : task.status
        }
      />
    </StyledDetailsLink>
  );
};

export default TaskStatus;
