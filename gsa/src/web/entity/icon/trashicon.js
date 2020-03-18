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

import PropTypes from 'web/utils/proptypes';
import withCapabilities from 'web/utils/withCapabilities';
import Capabilities from 'gmp/capabilities/capabilities';

import TrashIcon from 'web/components/icon/trashicon';
import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {useGetCaps} from 'web/pages/tasks/graphql';

const EntityTrashIcon = ({
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

  let capabilities;

  const query = useGetCaps();
  const {data} = query();

  if (isDefined(data)) {
    capabilities = new Capabilities(data.capabilities);
  } else {
    capabilities = props.capabilities; // fallback to HOC
  }

  const mayDelete =
    capabilities.mayDelete(name) && entity.userCapabilities.mayDelete(name);

  const active = mayDelete && entity.isWritable() && !entity.isInUse();
  if (!isDefined(title)) {
    if (active) {
      title = _('Move {{entity}} to trashcan', {entity: displayName});
    } else if (entity.isInUse()) {
      title = _('{{entity}} is still in use', {entity: displayName});
    } else if (!entity.isWritable()) {
      title = _('{{entity}} is not writable', {entity: displayName});
      // eslint-disable-next-line no-negated-condition
    } else if (!mayDelete) {
      title = _('Permission to move {{entity}} to trashcan denied', {
        entity: displayName,
      });
    } else {
      title = _('Cannot move {{entity}} to trashcan', {entity: displayName});
    }
  }
  return (
    <TrashIcon
      {...props}
      title={title}
      value={entity}
      active={active}
      onClick={active ? onClick : undefined}
    />
  );
};

EntityTrashIcon.propTypes = {
  displayName: PropTypes.string,
  entity: PropTypes.model.isRequired,
  name: PropTypes.string,
  title: PropTypes.string,
  onClick: PropTypes.func,
};

// withCapabilities is not necessary technically
// for the poc I want to keep as much of the code/tests unchanged
// and getting rid of it will cause many tests to fail
// hence it stays until graphql can be further integrated
export default withCapabilities(EntityTrashIcon);

// vim: set ts=2 sw=2 tw=80:
