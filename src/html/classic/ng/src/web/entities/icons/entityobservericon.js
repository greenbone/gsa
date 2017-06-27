
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
import {is_defined, is_empty} from '../../../utils.js';

import PropTypes from '../../proptypes.js';

import Icon from '../../components/icon/icon.js';

const ObserverIcon = ({
    entity,
    userName,
    displayName = _('Entity'),
  }) => {

  let owner = is_defined(entity.owner) ? entity.owner.name : undefined;

  if (owner === userName) {
    return null;
  }

  let title;
  if (is_empty(owner)) {
    title = _('Global {{type}}', {type: displayName});
  }
  else {
    title = _('{{type}} owned by {{owner}}', {type: displayName, owner});
  }
  return (
    <Icon
      alt={title}
      title={title}
      img="view_other.svg"
    />
  );
};

ObserverIcon.propTypes = {
  entity: PropTypes.model.isRequired,
  displayName: PropTypes.string,
  userName: PropTypes.string.isRequired,
};

export default ObserverIcon;

// vim: set ts=2 sw=2 tw=80:
