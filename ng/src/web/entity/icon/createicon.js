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
import {is_defined, capitalize_first_letter} from 'gmp/utils.js';

import PropTypes from '../../utils/proptypes.js';

import CreateIcon from '../../components/icon/newicon.js';

const EntityCreateIcon = ({
  display = false,
  displayName,
  entity,
  mayCreate = true,
  name,
  title,
  onClick,
  ...props,
}, {capabilities}) => {

  if (!is_defined(name)) {
    name = entity.entity_type;
  }

  const active = mayCreate && capabilities.mayCreate(name);
  if (!display && !active) {
    return null;
  }

  if (!is_defined(displayName)) {
    displayName = _(capitalize_first_letter(name));
  }

  if (!is_defined(title)) {
    if (active) {
      title = _('Create new {{entity}}', {entity: displayName});
    }
    else if (!mayCreate) { // eslint-disable-line no-negated-condition
      title = _('{{entity}} may not be created', {entity: displayName});
    }
    else {
      title = _('Permission to create {{entity}} denied',
        {entity: displayName});
    }
  }
  return (
    <CreateIcon
      {...props}
      title={title}
      active={active}
      onClick={active ? onClick : undefined}/>
  );
};

EntityCreateIcon.propTypes = {
  display: PropTypes.bool,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayCreate: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

EntityCreateIcon.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default EntityCreateIcon;

// vim: set ts=2 sw=2 tw=80:
