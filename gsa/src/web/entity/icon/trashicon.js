/* Copyright (C) 2017-2021 Greenbone Networks GmbH
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License
 * as published by the Free Software Foundation, either version 3
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import React from 'react';

import _ from 'gmp/locale';

import {getEntityType, typeName} from 'gmp/utils/entitytype';
import {isDefined} from 'gmp/utils/identity';

import TrashcanIcon from 'web/components/icon/trashcanicon';

import PropTypes from 'web/utils/proptypes';
import useCapabilities from 'web/utils/useCapabilities';

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

  const capabilities = useCapabilities();

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
    <TrashcanIcon
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

export default EntityTrashIcon;

// vim: set ts=2 sw=2 tw=80:
