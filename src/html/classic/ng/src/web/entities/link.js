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

import _ from '../../locale.js';
import {is_defined, is_empty} from '../../utils.js';

import LegacyLink from '../legacylink.js';
import PropTypes from '../proptypes.js';

export const EntityLink = ({
    entity,
    type,
    ...props,
  }, {capabilities}) => {
  const {id, trash, name, permissions, deleted} = entity;

  if (!is_defined(type)) {
    type = entity.type;
  }

  if (trash === '1') {
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

  if (is_defined(deleted) && deleted !== '0') {
    return (
      <b>{_('Orphan')}</b>
    );
  }

  if (is_defined(permissions) && is_empty(permissions)) {
    return (
      <span>
        {name}
      </span>
    );
  }

  let cmd;
  let id_name;
  let other = {};

  if (type === 'cve' || type === 'cpe' || type === 'ovaldef' ||
    type === 'cert_bund_adv' || type === 'dfn_cert_adv') {
    id_name = 'info_id';
    cmd = 'get_info';
    other.info_type = type;
    type = 'info';
  }
  else if (type === 'nvt') {
    id_name = 'info_id';
    cmd = 'get_info';
    other.info_type = type;
    other.details = '1';
    type = 'info';
  }
  else if (type === 'host' || type === 'os') {
    id_name = 'asset_id';
    cmd = 'get_asset';
    other.asset_type = type;
    type = 'assets';
  }
  else {
    id_name = type + '_id';
    cmd = 'get_' + type;
    type += 's';
  }

  if (!capabilities.mayAccess(type)) {
    return (
      <span>
        {name}
      </span>
    );
  }

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
  type: PropTypes.string,
};

EntityLink.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default EntityLink;

// vim: set ts=2 sw=2 tw=80:
