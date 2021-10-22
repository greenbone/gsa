/* Copyright (C) 2017-2020 Greenbone Networks GmbH
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
        status={task.isContainer() ? TASK_STATUS.container : task.status}
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
