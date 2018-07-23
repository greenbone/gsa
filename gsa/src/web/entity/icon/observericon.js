
/* Greenbone Security Assistant
 *
 * Authors:
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2017 - 2018 Greenbone Networks GmbH
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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';

import PropTypes from '../../utils/proptypes.js';

import Icon from '../../components/icon/icon.js';

const ObserverIcon = ({
  entity,
  userName,
  displayName = _('Entity'),
}) => {
  const owner = isDefined(entity.owner) ? entity.owner.name : undefined;

  if (owner === userName) {
    return null;
  }

  let title;
  if (isDefined(owner)) {
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
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  userName: PropTypes.string.isRequired,
};

export default ObserverIcon;

// vim: set ts=2 sw=2 tw=80:
