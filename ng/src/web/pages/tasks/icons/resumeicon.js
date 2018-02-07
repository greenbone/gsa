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

import _ from 'gmp/locale.js';
import {is_defined} from 'gmp/utils';

import PropTypes from '../../../utils/proptypes.js';

import Icon from '../../../components/icon/icon.js';

const ResumeIcon = ({
  size,
  task,
  onClick
}, {capabilities}) => {

  if (task.isContainer()) {
    return (
      <Icon
        size={size}
        img="resume_inactive.svg"
        alt={_('Resume')}
        title={_('Task is a container')}/>
    );
  }

  if (is_defined(task.schedule)) {
    return (
      <Icon
        size={size}
        img="resume_inactive.svg"
        alt={_('Resume')}
        title={_('Task is scheduled')}/>
    );
  }

  if (task.isStopped()) {
    if (capabilities.mayOp('resume_task')) {
      return (
        <Icon
          size={size}
          title={_('Resume')}
          img="resume.svg"
          value={task}
          onClick={onClick}/>
      );
    }
    return (
      <Icon
        size={size}
        img="resume_inactive.svg"
        alt={_('Resume')}
        title={_('Permission to resume task denied')}/>
    );
  }

  return (
    <Icon
      size={size}
      img="resume_inactive.svg"
      alt={_('Resume')}
      title={_('Task is not stopped')}/>
  );
};

ResumeIcon.propTypes = {
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  onClick: PropTypes.func,
};

ResumeIcon.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default ResumeIcon;

// vim: set ts=2 sw=2 tw=80:
