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
import {is_defined, is_empty, pluralize_type} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import LegacyLink from '../components/link/legacylink.js';

const EntityLink = ({
  entity,
  ...props,
}, {capabilities}) => {
  const {id, name, permissions, deleted} = entity;
  const type = entity.entity_type;

  if (entity.isInTrash()) {
    return (
      <span>
        {name} (<span>in </span>
        <LegacyLink
          cmd="get_trash">
          {_('Trashcan')}
        </LegacyLink>)
      </span>
    );
  }

  if (is_defined(deleted) && deleted !== '0') { // FIXME is this still used?
    return (
      <b>{_('Orphan')}</b>
    );
  }

  if ((is_defined(permissions) && is_empty(permissions)) ||
    !capabilities.mayAccess(type)) {
    return (
      <span>
        {name}
      </span>
    );
  }

  let cmd;
  let id_name;
  let other = {};

  if (type === 'info') {
    id_name = 'info_id';
    other.info_type = entity.info_type;
    if (entity.info_type === 'nvt') {
      other.details = '1';
    }
  }
  else if (type === 'asset') {
    id_name = 'asset_id';
    other.asset_type = entity.asset_type;
  }
  else {
    id_name = type + '_id';
  }

  cmd = 'get_' + pluralize_type(type);

  props[id_name] = id;
  return (
    <LegacyLink
      {...props}
      {...other}
      cmd={cmd}>
      {name}
    </LegacyLink>
  );
};

EntityLink.propTypes = {
  entity: PropTypes.model.isRequired,
};

EntityLink.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default EntityLink;

// vim: set ts=2 sw=2 tw=80:
