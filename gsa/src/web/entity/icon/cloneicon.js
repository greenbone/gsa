/* Copyright (C) 2017-2019 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
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

import CloneIcon from 'web/components/icon/cloneicon';
import withCapabilities from 'web/utils/withCapabilities';

const EntityCloneIcon = ({
  capabilities,
  displayName,
  entity,
  mayClone = true,
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

  const active =
    mayClone &&
    capabilities.mayClone(name) &&
    entity.userCapabilities.mayAccess(name);
  if (!isDefined(title)) {
    if (active) {
      title = _('Clone {{entity}}', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayClone) {
      title = _('{{entity}} may not be cloned', {entity: displayName});
    } else {
      title = _('Permission to clone {{entity}} denied', {entity: displayName});
    }
  }
  return (
    <CloneIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityCloneIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayClone: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityCloneIcon);

// vim: set ts=2 sw=2 tw=80:
