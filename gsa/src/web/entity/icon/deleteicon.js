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

import _ from 'gmp/locale';

import {isDefined} from 'gmp/utils/identity';
import {getEntityType, typeName} from 'gmp/utils/entitytype';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import DeleteIcon from 'web/components/icon/deleteicon';

const EntityDeleteIcon = ({
  capabilities,
  displayName,
  entity,
  name,
  title,
  onClick,
  ...props
}) => {
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  const active = capabilities.mayDelete(name) && entity.isWritable() &&
      !entity.isInUse();
  if (!isDefined(title)) {
    if (active) {
      title = _('Delete {{entity}}', {entity: displayName});
    }
    else if (entity.isInUse()) {
      title = _('{{entity}} is still in use', {entity: displayName});
    }
    else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
    }
    else if (!capabilities.mayDelete(name)) { // eslint-disable-line no-negated-condition
      title = _('Permission to delete {{entity}} denied',
        {entity: displayName});
    }
    else {
      title = _('Cannot delete {{entity}}', {entity: displayName});
    }
  }
  return (
    <DeleteIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityDeleteIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityDeleteIcon);

// vim: set ts=2 sw=2 tw=80:
