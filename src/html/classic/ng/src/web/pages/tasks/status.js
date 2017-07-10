/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

import React from 'react';

import {is_defined} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import DetailsLink from '../../components/link/detailslink.js';

import StatusBar from '../../components/bar/statusbar.js';

const TaskStatus = ({task, links = true}) => {
  let report_id;
  if (is_defined(task.current_report)) {
    report_id = task.current_report.id;
  }
  else if (is_defined(task.last_report)) {
    report_id = task.last_report.id;
  }
  else {
    report_id = '';
    links = false;
  }

  return (
    <DetailsLink
      legacy
      type="report"
      id={report_id}
      result_hosts_only="1"
      notes="1"
      textOnly={!links}
    >
      <StatusBar
        status={task.isContainer() ? 'Container' : task.status}
        progress={task.progress}/>
    </DetailsLink>
  );
};

TaskStatus.propTypes = {
  links: PropTypes.bool,
  task: PropTypes.model.isRequired,
};

export default TaskStatus;

// vim: set ts=2 sw=2 tw=80:
