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

import CloneIcon from '../../components/icon/cloneicon.js';

const EntityCloneIcon = ({
    displayName,
    entity,
    mayClone = true,
    name,
    title,
    onClick,
    ...props,
  }, {capabilities}) => {

  if (!is_defined(displayName)) {
    displayName = _(capitalize_first_letter(name));
  }

  let active = mayClone && capabilities.mayClone(name);
  if (!is_defined(title)) {
    if (active) {
      title = _('Clone {{entity}}', {entity: displayName});
    }
    else if (!mayClone) { // eslint-disable-line no-negated-condition
      title = _('{{entity}} may not be cloned', {entity: displayName});
    }
    else {
      title = _('Permission to clone {{entity}} denied', {entity: displayName});
    }
  }
  return (
    <CloneIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}/>
  );
};

EntityCloneIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayClone: PropTypes.bool,
  name: PropTypes.string.isRequired,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

EntityCloneIcon.contextTypes = {
  capabilities: PropTypes.capabilities.isRequired,
};

export default EntityCloneIcon;

// vim: set ts=2 sw=2 tw=80:
