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

import PropTypes from '../../../utils/proptypes.js';

import Icon from '../../../components/icon/icon.js';

const  ImportIcon = ({
  size,
  task,
  onClick
}, {capabilities}) => {

  if (!task.isContainer() || !capabilities.mayCreate('report')) {
    return null;
  }

  return (
    <Icon
      value={task}
      size={size}
      img="upload.svg"
      onClick={onClick}
      alt={_('Import Report')}
      title={_('Import Report')}/>
  );
};

ImportIcon.propTypes = {
  size: PropTypes.iconSize,
  task: PropTypes.model.isRequired,
  onClick: PropTypes.func,
};

ImportIcon.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default ImportIcon;

// vim: set ts=2 sw=2 tw=80:
