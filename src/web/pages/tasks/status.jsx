/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import {TASK_STATUS} from 'gmp/models/task';
import {isDefined} from 'gmp/utils/identity';
import React from 'react';
import styled from 'styled-components';
import StatusBar from 'web/components/bar/statusbar';
import DetailsLink from 'web/components/link/detailslink';
import PropTypes from 'web/utils/proptypes';

const StyledDetailsLink = styled(DetailsLink)`
  &:hover {
    text-decoration: none;
  }
`;

const TaskStatus = ({task, links = true, isAudit = false}) => {
  let report_id;
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
      type={isAudit ? 'auditreport' : 'report'}
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

TaskStatus.propTypes = {
  isAudit: PropTypes.bool,
  links: PropTypes.bool,
  task: PropTypes.model.isRequired,
};

export default TaskStatus;
