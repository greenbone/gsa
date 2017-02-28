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
import {is_defined, capitalize_first_letter} from '../../../utils.js';

import PropTypes from '../../proptypes.js';

import EditIcon from '../../icons/editicon.js';

export const EntityEditIcon = ({
    entity,
    name,
    uname,
    title,
    onClick,
    ...props,
  }, {capabilities}) => {

  if (!is_defined(uname)) {
    uname = _(capitalize_first_letter(name));
  }

  let active = capabilities.mayDelete(name) && entity.isWriteable() &&
      !entity.isInUse();
  if (!is_defined(title)) {
    if (active) {
      title = _('Edit {{entity}}', {entity: uname});
    }
    else if (!entity.isWriteable()) {
      title = _('{{entity}} is not writable', {entity: uname});
    }
    else if (!capabilities.mayEdit(name)) { // eslint-disable-line no-negated-condition
      title = _('Permission to edit {{entity}} denied', {entity: uname});
    }
    else {
      title = _('Cannot modify {{entity}}');
    }
  }
  return (
    <EditIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active && onClick}/>
  );
};

EntityEditIcon.propTypes = {
  entity: PropTypes.model.isRequired,
  name: React.PropTypes.string.isRequired,
  title: React.PropTypes.string,
  uname: React.PropTypes.string,
  onClick: React.PropTypes.func,
};

EntityEditIcon.contextTypes = {
  capabilities: React.PropTypes.object.isRequired,
};

export default EntityEditIcon;
