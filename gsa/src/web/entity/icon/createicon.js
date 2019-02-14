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

import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';

import CreateIcon from 'web/components/icon/newicon';

const EntityCreateIcon = ({
  capabilities,
  display = false,
  displayName,
  entity,
  mayCreate = true,
  name,
  title,
  onClick,
  ...props
}) => {
  if (!isDefined(name)) {
    name = getEntityType(entity);
  }

  const active = mayCreate && capabilities.mayCreate(name);
  if (!display && !active) {
    return null;
  }

  if (!isDefined(displayName)) {
    displayName = typeName(name);
  }

  if (!isDefined(title)) {
    if (active) {
      title = _('Create new {{entity}}', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayCreate) {
      title = _('{{entity}} may not be created', {entity: displayName});
    } else {
      title = _('Permission to create {{entity}} denied', {
        entity: displayName,
      });
    }
  }
  return (
    <CreateIcon
      {...props}
      title={title}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityCreateIcon.propTypes = {
  capabilities: PropTypes.capabilities.isRequired,
  display: PropTypes.bool,
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  mayCreate: PropTypes.bool,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

export default withCapabilities(EntityCreateIcon);

// vim: set ts=2 sw=2 tw=80:
