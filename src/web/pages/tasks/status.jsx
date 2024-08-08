/* SPDX-FileCopyrightText: 2024 Greenbone AG
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import React from 'react';

import styled from 'styled-components';

import {isDefined} from 'gmp/utils/identity';

import {TASK_STATUS} from 'gmp/models/task';

import PropTypes from 'web/utils/proptypes';

import DetailsLink from 'web/components/link/detailslink';

import StatusBar from 'web/components/bar/statusbar';

const StyledDetailsLink = styled(DetailsLink)`
  &:hover {
    text-decoration: none;
  }
`;

const TaskStatus = ({task, links = true}) => {
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
    <StyledDetailsLink type="report" id={report_id} textOnly={!links}>
      <StatusBar
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
        progress={task.progress}
      />
    </StyledDetailsLink>
  );
};

TaskStatus.propTypes = {
  links: PropTypes.bool,
  task: PropTypes.model.isRequired,
};

export default TaskStatus;

// vim: set ts=2 sw=2 tw=80:
