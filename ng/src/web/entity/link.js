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
import {is_defined, is_empty} from 'gmp/utils.js';

import PropTypes from '../utils/proptypes.js';

import DetailsLink from '../components/link/detailslink.js';
import Link from '../components/link/link.js';

const EntityLink = ({
  entity,
  textOnly,
  ...props
}, {capabilities}) => {
  const {id, name, permissions, deleted} = entity;
  let type = entity.entity_type;

  if (entity.isInTrash()) {
    return (
      <span>
        {name} (<span>in </span>
        <Link
          textOnly={textOnly}
          to="trashcan"
          anchor={type}
        >
          {_('Trashcan')}
        </Link>)
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

  const other = {};

  if (type === 'info') {
    type = entity.info_type;
  }
  else if (type === 'asset') {
    type = entity.asset_type;
  }

  return (
    <DetailsLink
      {...props}
      {...other}
      id={id}
      type={type}
    >
      {name}
    </DetailsLink>
  );
};

EntityLink.propTypes = {
  entity: PropTypes.model.isRequired,
  textOnly: PropTypes.bool,
};

EntityLink.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default EntityLink;

// vim: set ts=2 sw=2 tw=80:
