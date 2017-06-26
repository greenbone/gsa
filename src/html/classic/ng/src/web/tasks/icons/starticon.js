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

import _ from '../../../locale.js';

import PropTypes from '../../proptypes.js';

import Icon from '../../icons/icon.js';

const StartIcon = ({
  task,
  onClick
}, {capabilities}) => {

  if (task.isRunning() || task.isContainer()) {
    return null;
  }

  if (!capabilities.mayOp('start_task')) {
    return (
      <Icon
        size="small"
        img="start_inactive.svg"
        title={_('Permission to start Task denied')}/>
    );
  }

  if (!task.isActive()) {
    return (
      <Icon
        size="small"
        img="start.svg"
        title={_('Start')}
        value={task}
        onClick={onClick}/>
    );
  }
  return (
    <Icon
      size="small"
      img="start_inactive.svg"
      title={_('Task is already active')}/>
  );
};

StartIcon.propTypes = {
  task: PropTypes.model.isRequired,
  onClick: PropTypes.func,
};

StartIcon.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default StartIcon;

// vim: set ts=2 sw=2 tw=80:
